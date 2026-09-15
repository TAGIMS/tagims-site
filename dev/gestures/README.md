# Gestures mobile test deployment

Public URL: https://tagims.com/dev/gestures/

This is the existing standalone Gestures Hub sandbox, copied from the Google Drive Gestures project. Front camera only; no gesture commands. Camera frames and tracking are processed on the device. MediaPipe JS/WASM 0.10.32 and its model download from the existing public CDN/Google URLs.

The hosted index sets its base to `/dev/gestures/` so assets resolve with or without a trailing slash. The tracker uses the public model URL instead of depending on a parent folder model file. Sandbox storage is namespaced separately from the main Hub.

Cloudflare Pages serves this directory. `worker/src/index.js` forwards this path and its assets to Pages. Both deploy through the existing GitHub integration.

Edit `gestures-widget.js` for tracking and `css/gestures.css` for its layout. For shell changes, edit `src/` and run `npm run build`. Run `npm test` with jsdom installed. Open the public URL directly in the phone browser, tap Start camera, and allow camera access. First tracking initialization can take longer while model/runtime assets download. Real mobile camera testing must be done on the device.
