#!/usr/bin/env bash
set -euo pipefail

# Template:
# ./publish_multi.sh creator /abs/path/video.mp4 "标题" "描述" xiaohongshu douyin

account="${1:-}"
media_path="${2:-}"
title="${3:-}"
body="${4:-}"
shift 4 || true

if [[ -z "${account}" || -z "${media_path}" || -z "${title}" || -z "${body}" || "$#" -eq 0 ]]; then
  echo "Usage: publish_multi.sh <account> <media_path> <title> <body> <platform...>"
  exit 1
fi

for platform in "$@"; do
  content publish "${platform}" upload-video --account "${account}" --file "${media_path}" --title "${title}" --desc "${body}"
done
