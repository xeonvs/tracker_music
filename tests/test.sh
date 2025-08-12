#!/usr/bin/env bash
set -euo pipefail;

cd "$(dirname "$0")/..";

git submodule update --init;

./generate_playlist.sh;
jq '.' playlist.json >/dev/null;

media_count=$(find media -type f \( -iname '*.mp3' -o -iname '*.ogg' -o -iname '*.wav' -o -iname '*.psg' -o -iname '*.psy' -o -iname '*.sndh' -o -iname '*.vtx' -o -iname '*.stc' -o -iname '*.pt3' -o -iname '*.sqt' -o -iname '*.sid' -o -iname '*.sap' -o -iname '*.mod' -o -iname '*.s3m' -o -iname '*.xm' -o -iname '*.it' \) | wc -l);
playlist_count=$(jq '. | length' playlist.json);
if [ "$playlist_count" -ne "$media_count" ]; then
  echo "Expected $media_count tracks, got $playlist_count";
  exit 1;
fi;

python -m http.server 8000 >/tmp/server.log 2>&1 &
server_pid=$!;
for _ in {1..10}; do
  if curl -fsI http://localhost:8000/index.cowbell.html >/dev/null 2>&1; then
    break;
  fi;
  sleep 1;
done;

curl -I http://localhost:8000/index.cowbell.html;
curl -I http://localhost:8000/playlist.json;

if [ -n "${CI:-}" ]; then
  python tests/e2e_test.py;
else
  echo "Skipping Playwright E2E tests; run in CI only.";
fi;

kill $server_pid 2>/dev/null || true;
wait $server_pid 2>/dev/null || true;

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck generate_playlist.sh;
else
  echo "shellcheck not installed; skipping.";
fi;

if command -v eslint >/dev/null 2>&1; then
  eslint player.js;
else
  echo "eslint not installed; skipping.";
fi;
