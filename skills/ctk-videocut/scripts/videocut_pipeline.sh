#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: content videocut pipeline <视频文件> --steps autocut,subtitle -o output/"
  exit 1
fi

content videocut pipeline "$@"
