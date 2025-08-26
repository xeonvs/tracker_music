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
For public hosting, requests for files under `/media` must include the `X-Player-Token` header that matches the `pt` cookie. The included `nginx.conf` demonstrates one way to enforce this in production:

1. Copy `nginx.conf` to `/etc/nginx/conf.d/tracker.conf`.
2. Adjust `server_name` and `root` to match your domain and installation path.
3. Reload Nginx, e.g. `sudo nginx -s reload`.

When served from GitHub Pages this protection is disabled automatically because custom response headers are not supported.

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
