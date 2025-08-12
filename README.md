# Tracker Music Web Player

A Winamp-styled web player for tracker modules powered by [Cowbell](https://github.com/demozoo/cowbell).

## Features
- Plays a variety of tracker formats and standard audio types
- Seek bar and shuffle support with persisted preferences
- Share button that copies a link to the current track

## Getting Started

1. Clone the repository and fetch the Cowbell submodule:

   ```
   git submodule update --init --recursive
   ```

2. Add tracker modules to the `media` directory and generate the playlist:

   ```
   ./generate_playlist.sh
   ```

3. Serve the repository root with any static HTTP server:

   ```
   python -m http.server
   ```

   Then open [http://localhost:8000/index.cowbell.html](http://localhost:8000/index.cowbell.html) in your browser.

Requests for files under `/media` must include the `X-Player-Token` header that matches the `pt` cookie. The repository contains an example nginx configuration.

## Hotkeys

- **Space** — Play/Pause  
- **Arrow Left/Right** — Previous/Next track  
- **Arrow Up/Down** — Volume

## Contributing

Pull requests and issues are welcome. Please run `./generate_playlist.sh` and ensure the site loads before submitting changes.

## License

This project is licensed under the [MIT License](LICENSE).
