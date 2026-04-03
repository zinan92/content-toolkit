#!/usr/bin/env bash
set -euo pipefail

title_file="${1:-}"
content_file="${2:-}"
shift 2 || true

if [[ -z "${title_file}" || -z "${content_file}" || "$#" -eq 0 ]]; then
  echo "Usage: xhs_publish_note.sh <title-file> <content-file> <image...>"
  exit 1
fi

content xiaohongshu publish --title-file "${title_file}" --content-file "${content_file}" --images "$@"
