#!/bin/sh
MEDIA_DIR="media"
OUTPUT="playlist.json"

echo "[" > "$OUTPUT"
first=true
for path in "$MEDIA_DIR"/*; do
  [ ! -f "$path" ] && continue
  file=$(basename "$path")
  [ "$file" = ".gitkeep" ] && continue
  title="${file%.*}"
  if [ "$first" = true ]; then
    first=false
  else
    printf ',\n' >> "$OUTPUT"
  fi
  printf '  {"title": "%s", "file": "%s"}' "$title" "$MEDIA_DIR/$file" >> "$OUTPUT"
done
printf '\n]\n' >> "$OUTPUT"
