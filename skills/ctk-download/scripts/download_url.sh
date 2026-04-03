#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: content download <URL> -o raw/"
  exit 1
fi

content download "$@"
