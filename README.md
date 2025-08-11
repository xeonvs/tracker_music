# Tracker Music Web Player

Winamp-styled web player for tracker modules using [Cowbell](https://github.com/demozoo/cowbell), included as a git submodule in `vendor/cowbell`.

## Usage

Serve the project with nginx or any static HTTP server. The entry point is `index.cowbell.html`.

Place tracker module files in the `media` directory. Requests to `/media` must include the `X-Player-Token` header matching the `pt` cookie as in the example nginx configuration.

After cloning the repository, fetch the Cowbell submodule:

```
git submodule update --init --recursive
```

The Cowbell SDK includes WebAssembly helpers (`libopenmpt.wasm` and `libpsgplay.wasm`) under `vendor/cowbell/cowbell/openmpt` and `vendor/cowbell/cowbell/psgplay`.

## Hotkeys

- **Space** — Play/Pause
- **Arrow Left/Right** — Previous/Next track
- **Arrow Up/Down** — Volume

Cowbell is provided via git submodule in `vendor/cowbell`.
