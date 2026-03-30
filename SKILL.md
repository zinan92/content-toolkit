---
name: content-toolkit
description: AI content pipeline — download, extract, rewrite, edit video, publish. One CLI for all capabilities.
allowed-tools:
  - Read
  - Write
  - Bash
---

# Content Toolkit

AI-powered content pipeline. From raw URL to published multi-platform content.

## Prerequisites

- Node.js 18+ (for the CLI)
- Git (for auto-installing capabilities)
- Capability-specific deps installed on first use (FFmpeg, Whisper, Claude CLI, Python 3)

## Installation

```bash
git clone https://github.com/zinan92/content-toolkit.git
cd content-toolkit
```

No `npm install` needed. Zero dependencies.

## Usage

```bash
content <capability> [args...]
```

Capabilities are auto-installed on first use. No need to pre-install.

## Pipeline Stages

| Stage | Command | What it does |
|-------|---------|-------------|
| 1 | `content intelligence` | Trend detection, viral attribution, topic suggestions |
| 2 | `content download <url>` | Download content from Douyin/XHS/WeChat/X |
| 3 | `content extract <dir>` | Video transcription, image OCR, article cleaning |
| 5 | `content rewrite <file>` | Rewrite for different platforms |
| 6 | `content videocut <sub> <file>` | Video editing (autocut/subtitle/hook/clip/cover/speed) |

## Videocut Subcommands

```bash
content videocut transcribe input.mp4 -o output/
content videocut autocut input.mp4 -o output/ --no-review
content videocut subtitle output/cut.mp4 -o output/
content videocut hook input.mp4 -o output/ --count 4
content videocut clip input.mp4 -o output/
content videocut cover -o output/ --quotes hooks.json
content videocut speed input.mp4 -o output/ --rate 1.1
content videocut pipeline input.mp4 --steps autocut,subtitle,hook
```

## Management

```bash
content list              # Show all capabilities
content list --installed  # Show installed only
content install <name>    # Pre-install a capability
content update <name>     # Git pull latest
content remove <name>     # Delete local copy
```

## Common Workflows

### Spoken-word video → multi-platform content
```bash
content videocut pipeline input.mp4 --steps autocut,speed,subtitle,hook,cover -o output/
```

### Download + rewrite for another platform
```bash
content download https://douyin.com/video/xxx -o raw/
content extract raw/
content rewrite raw/transcript.md --platform xhs
```
