# Third-party components

Kopi's launcher and local transcription adapter are maintained in this repository.
The editing engine and other dependencies are installed separately; they are not
claimed as Kopi's original work.

| Component | Author / source | License information |
| --- | --- | --- |
| Herk Edit Kit | [Nate Herk](https://github.com/nateherkai/herk-edit-kit) | MIT; the installation retains its LICENSE |
| HyperFrames | [HeyGen](https://github.com/heygen-com/hyperframes) | See the installed package's license |
| GSAP | [GreenSock / GSAP](https://gsap.com/) | See the installed package's license and terms |
| FFmpeg | [FFmpeg project](https://ffmpeg.org/) | Depends on the installed build; LGPL/GPL components may apply |
| faster-whisper | [SYSTRAN contributors](https://github.com/SYSTRAN/faster-whisper) | MIT; consult its runtime and model licenses too |

The exact engine revision is recorded in engine.json. Setup keeps its license
inside .kopi/engine/LICENSE. Installing a dependency does not transfer its
authorship or trademarks. Herk's example brand assets remain their owners'
property and must be replaced with your own authorized materials.
