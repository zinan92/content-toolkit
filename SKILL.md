---
name: content-toolkit
description: AI content pipeline — download, extract, rewrite, edit video, publish. One CLI for all capabilities. Read this to know WHEN and HOW to use each capability.
allowed-tools:
  - Read
  - Write
  - Bash
---

# Content Toolkit

AI-powered content pipeline. One CLI, all capabilities auto-installed on first use.

## Setup

```bash
git clone https://github.com/zinan92/content-toolkit.git
cd content-toolkit
```

Zero npm dependencies. Capabilities download on first use.

## Routing — When to Use What

Read the user's intent and match to the right capability:

### User has a URL or wants to find content
| Intent | Capability | Command |
|--------|-----------|---------|
| "下载这个视频" / "grab this video" / user provides a Douyin/XHS/WeChat/X URL | **download** | `content download <url> -o raw/` |
| "最近什么内容火" / "trending topics" / "帮我选题" | **intelligence** | `content intelligence` |

### User has raw content (video/image/article) and wants to understand it
| Intent | Capability | Command |
|--------|-----------|---------|
| "这个视频说了什么" / "transcribe this" / "把视频转成文字" | **extract** | `content extract <dir>` |
| "我录了一段口播" / user has a raw spoken-word video | **videocut transcribe** | `content videocut transcribe input.mp4 -o output/` |

### User has a video and wants to edit it
| Intent | Capability | Command |
|--------|-----------|---------|
| "帮我剪一下" / "去掉嗯啊" / "粗剪" / remove filler words | **videocut autocut** | `content videocut autocut input.mp4 -o output/ --no-review` |
| "加字幕" / "burn subtitles" | **videocut subtitle** | `content videocut subtitle input.mp4 -o output/` |
| "提取金句" / "找 hook" / "哪句话最有吸引力" | **videocut hook** | `content videocut hook input.mp4 -o output/` |
| "拆成短视频" / "分章节" / "长视频变短" | **videocut clip** | `content videocut clip input.mp4 -o output/` |
| "做封面" / "生成卡片" / "quote cards" | **videocut cover** | `content videocut cover -o output/ --quotes hooks.json` |
| "加速" / "太慢了" / "1.2倍" | **videocut speed** | `content videocut speed input.mp4 -o output/ --rate 1.1` |
| "一条龙" / "完整处理" / full pipeline | **videocut pipeline** | `content videocut pipeline input.mp4 --steps autocut,speed,subtitle,hook,cover -o output/` |

### User has text content and wants to repurpose it
| Intent | Capability | Command |
|--------|-----------|---------|
| "改写成小红书" / "发公众号" / "变成 X thread" | **rewrite** | `content rewrite transcript.md --platform xhs` |

## Decision Tree

```
User says something about content
├── Has a URL?
│   └── → content download <url>
├── Has a video file?
│   ├── Wants text from it?
│   │   └── → content videocut transcribe
│   ├── Wants to edit it?
│   │   ├── Remove filler/stutters → content videocut autocut
│   │   ├── Add subtitles → content videocut subtitle
│   │   ├── Extract hooks/quotes → content videocut hook
│   │   ├── Split into clips → content videocut clip
│   │   ├── Speed up → content videocut speed
│   │   ├── Generate cover/cards → content videocut cover
│   │   └── Full production → content videocut pipeline --steps autocut,speed,subtitle,hook,cover
│   └── Not sure what to do with it?
│       └── → content videocut autocut (most common starting point)
├── Has text/transcript?
│   ├── Wants to repurpose for another platform?
│   │   └── → content rewrite
│   └── Wants to understand trends?
│       └── → content intelligence
├── Has a directory of downloaded content?
│   └── → content extract
└── Doesn't have content yet?
    ├── Wants ideas? → content intelligence
    └── Has a URL? → content download
```

## Pipeline Order

When chaining videocut capabilities, use this order:

```
autocut → speed → subtitle → hook → clip → cover
```

- **autocut** first: cut filler before anything else
- **speed** before subtitle: subtitles are generated against the final-speed video
- **subtitle** before hook: hook can reuse the SRT file
- **cover** last: needs hooks.json from hook step

## Capability Details

Each capability has its own SKILL.md with full documentation. After auto-install, read it at:
`capabilities/<name>/SKILL.md` (for download/extract/rewrite/intelligence)
`capabilities/videocut/capabilities/<sub>/SKILL.md` (for videocut sub-capabilities)

### Quick Reference

| Capability | Input | Output | Requires |
|-----------|-------|--------|----------|
| intelligence | — | trend reports, topic suggestions | Python 3 |
| download | URL | video/image/article files + metadata | Python 3 |
| extract | directory of files | transcripts, OCR text, cleaned articles | Python 3, Whisper |
| rewrite | text file | platform-specific content | Python 3, Claude CLI |
| videocut transcribe | video file | transcript.json + .txt + .srt | Node, FFmpeg, Whisper |
| videocut autocut | video file | cut.mp4 (filler removed) | Node, FFmpeg, Whisper, Claude CLI |
| videocut subtitle | video file | subtitled.mp4 + .srt | Node, FFmpeg, Whisper |
| videocut hook | video file | hooks.json + hook.mp4 + segments/ | Node, FFmpeg, Whisper, Claude CLI |
| videocut clip | video file | chapters.json + clips/*.mp4 | Node, FFmpeg, Whisper, Claude CLI |
| videocut cover | hooks.json or text | card_*.png (1080x1080) | Node, Chrome |
| videocut speed | video file | speed.mp4 | Node, FFmpeg |

## Management Commands

```bash
content list              # Show all capabilities + install status
content install <name>    # Pre-install without running
content update <name>     # Git pull latest version
content remove <name>     # Delete local copy
```
