#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: prepare_publish_args.py <payload.json>")
        return 1

    payload_path = Path(sys.argv[1]).expanduser().resolve()
    payload = json.loads(payload_path.read_text())
    platform = payload["platform"]
    account = payload["account"]
    title = payload["title"]
    body = payload["body"]

    if payload["type"] == "video":
        media = Path(payload["file"]).expanduser().resolve()
        cmd = [
            "content",
            "publish",
            platform,
            "upload-video",
            "--account",
            account,
            "--file",
            str(media),
            "--title",
            title,
            "--desc",
            body,
        ]
    else:
        images = [str(Path(p).expanduser().resolve()) for p in payload["images"]]
        cmd = [
            "content",
            "publish",
            platform,
            "upload-note",
            "--account",
            account,
            "--images",
            *images,
            "--title",
            title,
            "--note",
            body,
        ]

    print(" ".join(cmd))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
