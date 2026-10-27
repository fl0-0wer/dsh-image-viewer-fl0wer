# DSH Image Viewer — fl0wer modified distribution

This is an MIT-licensed modification of [WSL043/dsh-image-viewer](https://github.com/WSL043/dsh-image-viewer), **not a from-scratch original**. WSL043 is the original author; fl0-0wer maintains this distribution of the locally used changes.

Version `dsh-image-viewer-fl0wer@0.1.17` distributes readable prebuilt JavaScript derived from the installed 0.1.16 viewer. `lib/client.js` is the authoritative runtime implementation. Inherited upstream `src/`, tests and build configuration are reference material and do not incorporate all fork modifications. Running the upstream build would overwrite the modified runtime. See `MODIFICATIONS.md` and `PATCHES/` for provenance and reproduction limitations.

The original supplies zoom, pan, actual size, gallery navigation, download, region notes and composer handoff. Local modifications add red/blue/white freehand strokes per image source, composited PNG clipboard copying, original-image candidate fallback across display/download/annotation preparation, and layout/inline-entry adjustments. Availability depends on accessible image sources, CORS and browser image clipboard support; fallback does not manufacture unavailable original pixels.

Download the pinned `.tgz` from this repository's [Releases](https://github.com/fl0-0wer/dsh-image-viewer-fl0wer/releases) and install it through DSH plugin management. Disable the original `dsh-image-viewer` first. Both variants provide the same viewer service and retain Cordis row ID `wsl043-native-image-viewer`; do not enable them together. The fork package and client module ID are `dsh-image-viewer-fl0wer`.

Dependency ranges are inherited from upstream and are listed in `package.json` and `compatibility.json`. This release validates static and package delivery contracts; it does not claim interactive qualification on every listed host version. Node.js requirement: `^22.19.0 || >=24.0.0`.

Readable `lib/*.js` and documented patches are open for review and modification. An unfinished source port is excluded from the installable package. Stale source maps are not distributed. The original copyright and MIT license remain in `LICENSE`; see `THIRD_PARTY_NOTICES.md` for attribution.

Fork: https://github.com/fl0-0wer/dsh-image-viewer-fl0wer

Upstream: https://github.com/WSL043/dsh-image-viewer
