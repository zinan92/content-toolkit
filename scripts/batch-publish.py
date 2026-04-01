#!/usr/bin/env python3
"""
Batch publish notes from a manifest.json to social platforms via `sau`.

Usage:
  python3 batch-publish.py manifest.json --account wendy --interval 4h --jitter 30m
  python3 batch-publish.py manifest.json --account wendy --interval 4h --jitter 30m --dry-run

Each note is scheduled at: base_time + (index * interval) + random(0, jitter)
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path


def parse_duration(s: str) -> timedelta:
    """Parse '4h', '30m', '2h30m' into timedelta."""
    hours = 0
    minutes = 0
    h_match = re.search(r"(\d+)h", s)
    m_match = re.search(r"(\d+)m", s)
    if h_match:
        hours = int(h_match.group(1))
    if m_match:
        minutes = int(m_match.group(1))
    if not h_match and not m_match:
        raise ValueError(f"Cannot parse duration: {s!r} (use e.g. '4h', '30m', '2h30m')")
    return timedelta(hours=hours, minutes=minutes)


def build_schedule(count: int, interval: timedelta, jitter: timedelta) -> list[datetime]:
    """Generate scheduled times starting from now."""
    now = datetime.now()
    times = []
    for i in range(count):
        base = now + interval * (i + 1)
        offset = timedelta(seconds=random.randint(0, int(jitter.total_seconds())))
        times.append(base + offset)
    return times


def build_sau_command(
    note: dict,
    base_dir: Path,
    account: str,
    platform: str,
    schedule_time: datetime | None,
) -> list[str]:
    """Build a sau CLI command for one note."""
    video_path = str((base_dir / note["files"]["video"]).resolve())
    text_path = base_dir / note["files"]["text"]

    text = text_path.read_text(encoding="utf-8").strip()
    lines = text.split("\n")
    title = next((l.lstrip("# ").strip() for l in lines if l.startswith("# ")), note["title"])
    body = "\n".join(l for l in lines if not l.startswith("# ")).strip()

    tags = re.findall(r"#(\S+)", body)[:5]

    note_type = note.get("type", "video")

    if note_type == "video":
        cmd = [
            "sau", platform, "upload-video",
            "--account", account,
            "--file", video_path,
            "--title", title,
            "--desc", body[:500],
        ]
    else:
        images = note.get("files", {}).get("images", [])
        image_paths = [str((base_dir / img).resolve()) for img in images]
        cmd = [
            "sau", platform, "upload-note",
            "--account", account,
            "--images", *image_paths,
            "--title", title,
            "--note", body[:500],
        ]

    for tag in tags:
        cmd.extend(["--tags", tag])

    if schedule_time:
        cmd.extend(["--schedule", schedule_time.strftime("%Y-%m-%d %H:%M")])

    return cmd


def main():
    parser = argparse.ArgumentParser(description="Batch publish notes via sau")
    parser.add_argument("manifest", help="Path to manifest.json")
    parser.add_argument("--account", required=True, help="sau account name")
    parser.add_argument("--platform", default=None, help="Target platform (default: from manifest)")
    parser.add_argument("--interval", default="4h", help="Time between posts (e.g. 4h, 2h30m)")
    parser.add_argument("--jitter", default="30m", help="Random offset range (e.g. 30m)")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing")
    parser.add_argument("--start-from", type=int, default=1, help="Start from note N (default: 1)")
    args = parser.parse_args()

    manifest_path = Path(args.manifest).resolve()
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    base_dir = manifest_path.parent
    notes = manifest["notes"]
    platform = args.platform or manifest.get("platform", "xiaohongshu")

    notes_to_publish = [n for n in notes if n["id"] >= args.start_from]
    if not notes_to_publish:
        print("No notes to publish.")
        sys.exit(0)

    interval = parse_duration(args.interval)
    jitter = parse_duration(args.jitter)
    schedule_times = build_schedule(len(notes_to_publish), interval, jitter)

    print(f"Platform:  {platform}")
    print(f"Account:   {args.account}")
    print(f"Notes:     {len(notes_to_publish)}")
    print(f"Interval:  {args.interval} + random(0, {args.jitter})")
    print(f"Span:      {schedule_times[0].strftime('%H:%M')} ~ {schedule_times[-1].strftime('%m-%d %H:%M')}")
    print()

    for note, scheduled_at in zip(notes_to_publish, schedule_times):
        cmd = build_sau_command(note, base_dir, args.account, platform, scheduled_at)

        print(f"[Note {note['id']}] {note['topic']}")
        print(f"  Schedule: {scheduled_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"  Command:  {' '.join(cmd[:8])}...")

        if args.dry_run:
            print("  [DRY RUN] Skipped")
        else:
            try:
                subprocess.run(cmd, check=True)
                print("  Done")
            except subprocess.CalledProcessError as e:
                print(f"  FAILED (exit {e.returncode})", file=sys.stderr)
                print(f"  Continue with remaining notes? [Y/n] ", end="")
                if input().strip().lower() == "n":
                    sys.exit(1)
            except FileNotFoundError:
                print("  Error: 'sau' not found. Install social-auto-upload first.", file=sys.stderr)
                sys.exit(1)
        print()

    if args.dry_run:
        print("Dry run complete. Remove --dry-run to execute.")
    else:
        print(f"All {len(notes_to_publish)} notes scheduled.")


if __name__ == "__main__":
    main()
