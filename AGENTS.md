# Agent Instructions

- The Cowbell SDK is included as a git submodule in `vendor/cowbell`. Run `git submodule update --init` if the folder is empty.
- Cowbell documentation lives at:
  - https://github.com/demozoo/cowbell/blob/main/doc/api.md
  - https://github.com/demozoo/cowbell/blob/main/doc/usage.md
- Example code for the SDK is available at https://github.com/demozoo/cowbell/tree/main/example
- Use 2-space indentation and terminate statements with semicolons.
- Automated tests live under `tests/`. Run `./tests/test.sh` for local linting and playlist validation. The script skips Playwright E2E checks unless the `CI` environment variable is set; do not install Playwright or browsers locally. Full tests, including Playwright, run in GitHub Actions. There is no `package.json`; do not run any `npm` commands.
- Prefer `rg` (ripgrep) for code search and avoid `ls -R` or `grep -R` to keep operations fast.
- For manual testing, run `./generate_playlist.sh`, then serve the repo root over HTTP (e.g. `python -m http.server`) and verify `index.cowbell.html` loads (for example with `curl -I http://localhost:8000/index.cowbell.html`). The custom nginx configuration from production is not required.
