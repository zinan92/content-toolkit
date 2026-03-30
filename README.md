# content-toolkit

AI content pipeline. One CLI, all capabilities. Download → Extract → Rewrite → Edit Video → Publish.

## Quick Start

```bash
git clone https://github.com/zinan92/content-toolkit.git
cd content-toolkit

# Use any capability — auto-installs on first run
content videocut autocut my-video.mp4 -o output/ --no-review
```

No `npm install`. No setup. Capabilities are downloaded on first use.

## Pipeline

```
 ┌─────────────────────────────────────────────────────────┐
 │  1. intelligence   趋势检测 / 爆款归因 / 选题建议       │
 │  2. download       统一下载 (抖音/小红书/公众号/X)       │
 │  3. extract        多模态提取 (转录/OCR/清洗)            │
 │  4. curator        100 选 3 (coming soon)                │
 │  5. rewrite        跨平台改写 (抖音→小红书/公众号)       │
 │  6. videocut       视频编辑 (7 个独立能力)               │
 │  7. publisher      多平台发布 (coming soon)              │
 │  8. tracker        效果追踪 (coming soon)                │
 └─────────────────────────────────────────────────────────┘
```

## Capabilities

| Command | Description | Requires |
|---------|-------------|----------|
| `content intelligence` | Trend detection, topic suggestions | Python 3 |
| `content download <url>` | Download from Douyin/XHS/WeChat/X | Python 3 |
| `content extract <dir>` | Transcribe, OCR, clean articles | Python 3, Whisper |
| `content rewrite <file>` | Rewrite for target platform | Python 3, Claude CLI |
| `content videocut <sub> <file>` | 7 video editing capabilities | Node.js, FFmpeg, Whisper, Claude CLI |

### Videocut Sub-capabilities

| Sub-command | What |
|------------|------|
| `transcribe` | Speech → text (Whisper) |
| `autocut` | Remove filler words, stutters, silence |
| `subtitle` | Detect, generate, burn subtitles |
| `hook` | Extract memorable quotes as video clips |
| `clip` | Split long video into chapters |
| `cover` | Generate thumbnail + quote cards |
| `speed` | Intelligent speed adjustment (1.1x-1.2x) |
| `pipeline` | Chain multiple sub-capabilities |

## Management

```bash
content list                # Show all capabilities + install status
content install <name>      # Pre-install (otherwise auto-installed on first use)
content update <name>       # Pull latest version
content remove <name>       # Delete local copy
```

## For AI Agents

Read `SKILL.md` for the full capability reference. Each installed capability also has its own `SKILL.md` with detailed usage.

## Architecture

```
content-toolkit/
├── cli.js            # Unified entry point
├── install.js        # Lazy installer (clone on first use)
├── registry.json     # Capability registry (repos + deps)
├── capabilities/     # Auto-populated on use
│   ├── download/     # → zinan92/content-downloader
│   ├── extract/      # → zinan92/content-extractor
│   ├── rewrite/      # → zinan92/content-rewriter
│   ├── videocut/     # → zinan92/videocut
│   └── intelligence/ # → zinan92/content-intelligence
├── SKILL.md          # Agent entry point
└── README.md
```

Each capability is an independent repo, cloned on demand. Zero npm dependencies in the toolkit itself.

## License

MIT
