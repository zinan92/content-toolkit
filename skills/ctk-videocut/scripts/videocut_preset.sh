#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: content videocut preset <预设> <视频文件> -o output/"
  exit 1
fi

content videocut preset "$@"
