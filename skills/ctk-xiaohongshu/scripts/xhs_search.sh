#!/usr/bin/env bash
set -euo pipefail

keyword="${1:-}"

if [[ -z "${keyword}" ]]; then
  echo "Usage: xhs_search.sh <keyword>"
  exit 1
fi

content xiaohongshu search-feeds --keyword "${keyword}"
