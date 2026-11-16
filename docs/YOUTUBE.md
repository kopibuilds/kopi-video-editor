# YouTube source downloads

yt-dlp is a required Kopi dependency, installed automatically when missing during
setup, `node kopi.mjs dependencies`, or a YouTube download. Approved Kopi updates
must run the dependencies command before reporting success. Existing working
installations are reused. Windows and macOS official standalone builds are selected
for the processor; supported Linux builds use glibc. Unsupported systems or blocked
downloads fail clearly rather than claiming setup is complete.

Installation uses the official yt-dlp GitHub release and its SHA256 checksum,
with bounded downloads and a version check before activation. It writes only to
ignored .kopi/tools, needs no system-wide install, and does not access credentials.
Checksums validate the download against the published release; they are not an
independent signature. No background yt-dlp upgrades are performed.

Use existing FFmpeg; this helper does not use Canva, a paid downloader,
browser cookies, saved logins or account tokens. yt-dlg is a graphical frontend;
it does not establish that the yt-dlp executable is available on PATH.

`node kopi.mjs doctor` reports the existing downloader. It tries `KOPI_YT_DLP`,
then `.kopi/tools/yt-dlp[.exe]`, then PATH. `--yt-dlp /path/to/executable` selects
an existing executable for one download. If missing, the dependency installer
handles it without requiring the user to request yt-dlp separately. Do not
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
