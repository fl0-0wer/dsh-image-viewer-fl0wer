# Modification provenance

Original project: WSL043/dsh-image-viewer, MIT, installed package metadata 0.1.16. This is a modified distribution, not a from-scratch original.

The authoritative implementation is readable prebuilt lib/client.js, copied from the locally used modified viewer. It includes freehand red/blue/white strokes, source-specific ink storage, composited image clipboard writing, full-size source candidates and fallbacks for display/download/annotation, and layout/inline-image adjustments.

Distribution-only changes: package name/version/repository metadata; client module registration ID changed from dsh-image-viewer to dsh-image-viewer-fl0wer; Cordis patch package name changed accordingly while retaining row ID wsl043-native-image-viewer; stale source map link removed. Runtime feature logic is preserved. Disable the original viewer before using the fork.

PATCHES/patch2.py is the historical candidate-chain patch with only its hardcoded machine path replaced by a command-line argument. It expects an intermediate locally modified bundle that already has drawing and clipboard features. It is not an all-in-one patch against a clean upstream checkout, is not idempotent, and does not reproduce the entire released bundle by itself. Use it only on a disposable copy; it makes a timestamped backup.

Inherited upstream src/, tests, tsdown configuration and CI are historical reference only. They do not reproduce this prebuilt release and must not be represented as validation of fork features. The unfinished source port is excluded from this release.

Released lib/client.js SHA-256: 950b2b1942e3c19e84d16579a0200246e57e99f4aa7cf8aa58c5172979ee1519

Validation: node syntax checks, module registration capture, package paths/identity and package content checks. No claim of complete interactive browser testing or qualification on every inherited host version.
