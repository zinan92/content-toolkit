#!/usr/bin/env bash
set -euo pipefail

title_file="${1:-}"
content_file="${2:-}"
video_file="${3:-}"

if [[ -z "${title_file}" || -z "${content_file}" || -z "${video_file}" ]]; then
  echo "Usage: xhs_publish_video.sh <title-file> <content-file> <video-file>"
  exit 1
fi

content xiaohongshu publish-video --title-file "${title_file}" --content-file "${content_file}" --video "${video_file}"
