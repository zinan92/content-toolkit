---
name: content-toolkit
description: AI content pipeline orchestrator — routes user intent to the right capability. Does not own business logic. Read this to know HOW to route content tasks.
allowed-tools:
  - Read
  - Write
  - Bash
---

# Content Toolkit (Orchestrator)

Registry-driven orchestrator for AI content capabilities. Routes user intent to independently executable capability repos. Does not own download, extract, rewrite, videocut, or analysis logic — those live in their own repos.

## Your Job as Orchestrator

1. **Understand user intent** — what stage of the content pipeline are they in?
2. **Select the right capability** — use the routing table below
3. **Run the capability** — `content <capability> [args]`
4. **Suggest the next step** — use the workflow edges

## Routing Table

| User says | Capability | Command |
|-----------|-----------|---------|
| Has a URL, wants content locally | **download** | `content download <url>` |
| Has downloaded content, wants text | **extract** | `content extract <dir>` |
| Has a video file, wants to edit it | **videocut** | `content videocut <sub> <file>` |
| Has text, wants it on another platform | **rewrite** | `content rewrite <path>` |
| Wants trends, topics, content ideas | **intelligence** | `content intelligence <dirs>` |

## Decision Tree

```
User says something about content
├── Has a URL?
│   └── → content download <url>
├── Has downloaded content directory?
│   ├── Wants text/transcription?
│   │   └── → content extract <dir>
│   ├── Wants to analyze trends?
│   │   └── → content intelligence <dir>
│   └── Wants to repurpose?
│       └── → content extract → content rewrite
├── Has a video file (not from downloader)?
│   ├── Wants text from it?
│   │   └── → content videocut transcribe <file>
│   ├── Wants to edit it?
│   │   └── → content videocut <autocut|subtitle|hook|clip|speed> <file>
│   └── Full production?
│       └── → content videocut pipeline <file> --steps autocut,subtitle,hook,cover
├── Has text/transcript?
│   └── → content rewrite <path> --to xiaohongshu,wechat
└── Doesn't have content yet?
    ├── Wants ideas? → content intelligence
    └── Has a URL? → content download
```

## Workflow Chains

Common multi-capability sequences:

```
download → extract → rewrite              # Content repurposing
download → videocut pipeline              # Video production
download → intelligence                    # Content analysis
download → extract → videocut hook → cover # Quote card generation
```

One-command workflow:
```bash
content workflow douyin-to-xhs <url>      # Full pipeline: download → extract → hook → cover → rewrite → package
```

## Capability Details

Each capability has its own `SKILL.md` with full documentation. After install:
- `capabilities/<name>/SKILL.md`

For detailed routing, input/output contracts, and failure modes, read the capability's own SKILL.md.

## Management Commands

```bash
content list              # Show all capabilities + install/health status
content health            # Detailed health report per capability
content install <name>    # Pre-install a capability
content update <name>     # Update an installed capability
content remove <name>     # Remove a capability
content workflow <name>   # Run a fixed workflow preset
```

## Architecture

```
content-toolkit (this repo)
├── registry.v2.json      # Source of truth: capability metadata
├── cli.js                # Command router
├── install.js            # Install/update/health distribution layer
├── workflows.js          # Fixed workflow presets
└── capabilities/         # Local install cache
    ├── .meta/            # Install metadata per capability
    ├── download/         # → zinan92/content-downloader
    ├── extract/          # → zinan92/content-extractor
    ├── rewrite/          # → zinan92/content-rewriter
    ├── videocut/         # → zinan92/videocut
    └── intelligence/     # → zinan92/content-intelligence
```

## What This Repo Owns

- **Orchestration**: intent routing, capability selection, workflow chaining
- **Registry**: capability discovery, metadata, workflow edges
- **Distribution**: install, update, health check, local cache

## What This Repo Does NOT Own

- Download logic → `zinan92/content-downloader`
- Extraction logic → `zinan92/content-extractor`
- Rewriting logic → `zinan92/content-rewriter`
- Video editing logic → `zinan92/videocut`
- Analysis logic → `zinan92/content-intelligence`
