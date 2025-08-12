# Agent Instructions

- The Cowbell SDK is included as a git submodule in `vendor/cowbell`. Run `git submodule update --init` if the folder is empty.
- Cowbell documentation lives at:
  - https://github.com/demozoo/cowbell/blob/main/doc/api.md
  - https://github.com/demozoo/cowbell/blob/main/doc/usage.md
- Example code for the SDK is available at https://github.com/demozoo/cowbell/tree/main/example
- Use 2-space indentation and terminate statements with semicolons.
- Automated tests live under `tests/`. Run `./tests/test.sh` for linting and playlist validation. The same script runs in CI and only executes Playwright when the `CI` environment variable is set; do not install Playwright or browsers locally. There is no `package.json`; do not run any `npm` commands.
- GitHub Actions run in `.github/workflows/ci.yml`. Comment `retest` or `retest please` on a pull request to trigger the workflow
  again if you have write access.
- Prefer `rg` (ripgrep) for code search and avoid `ls -R` or `grep -R` to keep operations fast.
- Manual checks are optional: `./tests/test.sh` already covers playlist generation and basic server availability, but you can still run `./generate_playlist.sh` and serve the repo over HTTP if you need to inspect pages manually.
