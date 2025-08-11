# Tracker Music Web Player

Winamp-styled web player for tracker modules using [Cowbell](vendor/cowbell/README.md).

## Usage

Serve the project with nginx or any static HTTP server. The entry point is `index.cowbell.html`.

Place tracker module files in the `media` directory. Requests to `/media` must include the `X-Player-Token` header matching the `pt` cookie as in the example nginx configuration.

The Cowbell SDK expects WebAssembly helpers (`libopenmpt.wasm` and `libpsgplay.wasm`) in the `vendor/cowbell/cowbell/openmpt` and `vendor/cowbell/cowbell/psgplay` folders. These binaries are omitted from the repository; copy them from the upstream Cowbell distribution before serving the player.

## Hotkeys

- **Space** — Play/Pause
- **Arrow Left/Right** — Previous/Next track
- **Arrow Up/Down** — Volume

The Cowbell SDK is vendored in `vendor/cowbell`.
