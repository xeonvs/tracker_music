# Tracker Music Web Player

A Winamp-styled web player for [music modules](https://modarchive.org/index.php) powered by [Cowbell](https://github.com/demozoo/cowbell).

## Features
- Plays a variety of [music modules](https://modarchive.org/index.php) formats and standard audio types
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

For public hosting, requests for files under `/media` must include the `X-Player-Token` header that matches the `pt` cookie. See `nginx.conf` for an example configuration.

## Hotkeys

- **Space** — Play/Pause  
- **Arrow Left/Right** — Previous/Next track  
- **Arrow Up/Down** — Volume

## Known Issues

- Volume not changing. See [#8](https://github.com/demozoo/cowbell/issues/8)
- Fake visualisation
  
## Contributing

Pull requests and issues are welcome.

## License

This project is licensed under the [MIT License](LICENSE).
