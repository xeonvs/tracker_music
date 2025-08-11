#!/bin/bash
MEDIA_DIR="media"
OUTPUT="playlist.json"

echo "[" > "$OUTPUT"
first=true
for path in "$MEDIA_DIR"/*; do
  [ ! -f "$path" ] && continue
  file=$(basename "$path")
  [ "$file" = ".gitkeep" ] && continue
  title="${file%.*}"
  title="${title//_/ }"
  json=$(jq -n --arg title "$title" --arg file "$MEDIA_DIR/$file" '{title: $title, file: $file}')
  if [ "$first" = true ]; then
    first=false
  else
    printf ',\n' >> "$OUTPUT"
  fi
  printf '  %s' "$json" >> "$OUTPUT"
done
printf '\n]\n' >> "$OUTPUT"
