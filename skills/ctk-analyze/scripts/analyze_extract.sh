#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: content analyze extract <内容目录>"
  exit 1
fi

content analyze extract "$@"
