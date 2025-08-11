# Agent Instructions

- The Cowbell SDK is included as a git submodule in `vendor/cowbell`. Run `git submodule update --init` if the folder is empty.
- Cowbell documentation lives at:
  - https://github.com/demozoo/cowbell/blob/main/doc/api.md
  - https://github.com/demozoo/cowbell/blob/main/doc/usage.md
- Example code for the SDK is available at https://github.com/demozoo/cowbell/tree/main/example
- Use 2-space indentation and terminate statements with semicolons.
- No automated test suite is present; running `npm test` will fail because `package.json` is missing. Execute it anyway as a best-effort check.
- Prefer `rg` (ripgrep) for code search and avoid `ls -R` or `grep -R` to keep operations fast.
- To preview the player locally, serve the repo root over HTTP (e.g. `python -m http.server`) and open `index.cowbell.html` in a browser.
