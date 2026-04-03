#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: content rewrite preset <预设> <目录或文本> --from <来源>"
  exit 1
fi

content rewrite preset "$@"
