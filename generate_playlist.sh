#!/bin/bash
MEDIA_DIR="media"
OUTPUT="playlist.json"

echo "[" > "$OUTPUT"
first=true
for path in "$MEDIA_DIR"/*; do
  [ ! -f "$path" ] && continue
  file=$(basename "$path")
  [ "$file" = ".gitkeep" ] && continue
  ext="${file##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
  case "$ext" in
    mp3|ogg|wav|psg|psy|sndh|vtx|stc|pt3|sqt|sid|sap|mod|s3m|xm|it)
      ;;
    *)
      echo "Skipping unsupported file: $file" >&2
      continue
      ;;
  esac
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
