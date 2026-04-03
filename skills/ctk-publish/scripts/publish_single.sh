#!/usr/bin/env bash
set -euo pipefail

# Template:
# ./publish_single.sh xiaohongshu upload-video creator /abs/path/video.mp4 "标题" "描述"

platform="${1:-}"
mode="${2:-}"
account="${3:-}"
media_path="${4:-}"
title="${5:-}"
body="${6:-}"

if [[ -z "${platform}" || -z "${mode}" || -z "${account}" || -z "${media_path}" || -z "${title}" || -z "${body}" ]]; then
  echo "Usage: publish_single.sh <platform> <upload-video|upload-note> <account> <media_path> <title> <body>"
  exit 1
fi

if [[ "${mode}" == "upload-video" ]]; then
  content publish "${platform}" upload-video --account "${account}" --file "${media_path}" --title "${title}" --desc "${body}"
else
  content publish "${platform}" upload-note --account "${account}" --images "${media_path}" --title "${title}" --note "${body}"
fi
