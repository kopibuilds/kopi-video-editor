# YouTube source downloads

Use existing yt-dlp and FFmpeg; this helper does not use Canva, a paid downloader,
browser cookies, saved logins or account tokens. yt-dlg is a graphical frontend;
it does not establish that the yt-dlp executable is available on PATH.

`node kopi.mjs doctor` reports the existing downloader. It tries `KOPI_YT_DLP`,
then `.kopi/tools/yt-dlp[.exe]`, then PATH. `--yt-dlp /path/to/executable` selects
an existing executable for one download. If missing, help the user install the
official yt-dlp package after checking existing tools and permissions. Do not
reinstall Python or Whisper because a sandbox blocks its launcher.

```sh
node kopi.mjs download https://www.youtube.com/watch?v=AbCdEf123_-
node kopi.mjs download https://youtu.be/AbCdEf123_- --output inbox/my-source --max-height 1080
```

The example ID is fictional. Supply one HTTPS video URL; channel monitoring and
playlist batches are not implemented. Tracking parameters are removed. Completed
media and source metadata stay inside inbox. Maximum height defaults to 1080;
720, 1440 and 2160 are available. The source is preserved for transcription/editing.

The launcher disables yt-dlp config/cache loading, playlist traversal and output
overwrites, bounds network/fragment retries, and imposes a 20-minute process
timeout. Partial downloads remain for a deliberate retry. A failed download never
automatically escalates to browser-cookie extraction, credentials or another
provider. If a public download needs sign-in, stop and explain the actual problem.
Any credential use requires the user's separately authorized scope.

A successful downloader exit is checked for a nonempty completed video. Before
editing, use ffprobe and source inspection to verify the actual media. A download
is not a transcript or a finished edit. Use local `node kopi.mjs transcribe` and
the selected workflow, respecting the user's review instructions.
