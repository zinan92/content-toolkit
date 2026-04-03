#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: content rewrite <目录或文本> --from <来源> --to <目标>"
  exit 1
fi

content rewrite "$@"
