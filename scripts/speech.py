"""Write local speech recognition output in Herk Edit Kit's documented format."""
import argparse
import json
import math
import subprocess
import sys
from pathlib import Path


def recognize(recording, model_name, device):
    from faster_whisper import WhisperModel

    precision = "int8" if device == "cpu" else "float16"
    recognizer = WhisperModel(model_name, device=device, compute_type=precision)
    sections, info = recognizer.transcribe(str(recording), word_timestamps=True)
    tokens = []
    for section in sections:
        for token in section.words or []:
            if not token.word.strip():
                continue
            if not (math.isfinite(token.start) and math.isfinite(token.end)
                    and 0 <= token.start <= token.end):
                raise ValueError("Recognizer returned an invalid word timestamp")
            tokens.append({"text": token.word.strip(), "start": token.start, "end": token.end})
    probe = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(recording)],
        capture_output=True, text=True, check=True,
    )
    duration = float(json.loads(probe.stdout)["format"]["duration"])
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError("Recording duration is invalid")
    if not tokens:
        raise ValueError("No spoken words found; no transcript was written")
    if tokens[-1]["end"] > duration + 0.5:
        raise ValueError("Word timestamps extend beyond the recording")
    return {
        "text": " ".join(item["text"] for item in tokens),
        "audio_duration_secs": duration,
        "words": tokens,
        "kopi": {"language": info.language, "provider": "local faster-whisper", "model": model_name},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("recording", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--model", default="small")
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    args = parser.parse_args()
    recording, output = args.recording.resolve(), args.output.resolve()
    if not recording.is_file():
        parser.error("Recording is not a file")
    if output == recording or output.exists():
        parser.error("Choose a new output file; existing files are never overwritten")
    result = recognize(recording, args.model, args.device)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation protects a transcript produced by a concurrent process.
    with output.open("x", encoding="utf-8") as target:
        json.dump(result, target, ensure_ascii=False, indent=2)
        target.write("\n")
    print(f"Saved {len(result['words'])} words to {output}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Local transcription failed: {error}", file=sys.stderr)
        sys.exit(1)
