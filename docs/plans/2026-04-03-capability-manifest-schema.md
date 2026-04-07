# Capability Manifest Schema

**Date:** 2026-04-03
**Phase:** 1 — Registry and Capability Contract

## Purpose

`capability.json` lives inside each capability repo. It is the self-description contract that lets the orchestrator (and humans) understand what the capability does, how to run it, what it accepts, and what it produces — without reading source code.

## Target `capability.json` Schema

```jsonc
{
  "id": "download",
  "name": "Content Downloader",
  "version": "1.0.0",
  "description": "Unified content download from Douyin, Xiaohongshu, WeChat, and X/Twitter",

  "entrypoint": "content-downloader download",
  "skill_path": "SKILL.md",

  "install": {
    "method": "pip",
    "command": "pip install -e ."
  },
  "update": {
    "method": "git-pull"
  },

  "dependencies": {
    "system": ["python3"],
    "python": ">=3.11",
    "node": null
  },

  "input_types": [
    {
      "type": "url",
      "description": "Platform content URL",
      "examples": ["https://douyin.com/video/xxx", "https://xiaohongshu.com/explore/xxx"]
    }
  ],
  "output_types": [
    {
      "type": "content-directory",
      "description": "Directory containing downloaded media files and metadata.json",
      "structure": "<platform>/<user>/<content_id>/"
    }
  ],

  "resources": {
    "scripts": "scripts/",
    "references": "references/",
    "assets": null,
    "examples": "examples/"
  },

  "tags": ["download", "douyin", "xhs", "wechat", "x", "media"],

  "workflow": {
    "before": [],
    "after": ["extract"]
  }
}
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Must match the registry entry id |
| `name` | string | Human-readable name |
| `version` | string | Semver version |
| `entrypoint` | string | CLI command to execute |
| `dependencies.system` | string[] | System-level requirements |
| `input_types` | object[] | What the capability accepts |
| `output_types` | object[] | What the capability produces |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | One-line description |
| `skill_path` | string | Path to SKILL.md (default: `SKILL.md`) |
| `install` | object | Install instructions |
| `update` | object | Update instructions |
| `dependencies.python` | string | Python version constraint |
| `dependencies.node` | string | Node version constraint |
| `resources` | object | Paths to bundled resources |
| `tags` | string[] | Discovery tags |
| `workflow.before` | string[] | Predecessor capabilities |
| `workflow.after` | string[] | Successor capabilities |
| `subcommands` | object[] | Sub-capability definitions (for compound capabilities like videocut) |

## Subcommand Schema (for `videocut`)

Compound capabilities like `videocut` should enumerate their sub-capabilities:

```jsonc
{
  "subcommands": [
    {
      "id": "transcribe",
      "entrypoint": "node cli.js transcribe",
      "input_types": [{"type": "video-file"}],
      "output_types": [{"type": "transcript-json"}, {"type": "srt-file"}]
    },
    {
      "id": "autocut",
      "entrypoint": "node cli.js autocut",
      "input_types": [{"type": "video-file"}],
      "output_types": [{"type": "video-file"}]
    }
  ]
}
```

## Relationship to Registry

| Concern | Lives In | Authoritative Source |
|---------|----------|---------------------|
| How to find the repo | Registry | Registry |
| How to install the repo | Both | Registry (may override manifest) |
| What the capability does | Manifest | Manifest |
| Input/output contract | Manifest | Manifest |
| Workflow position | Both | Manifest is canonical; registry may cache |
| Fallback and pointer info | Registry | Registry (not the capability's concern) |

The registry may cache fields from the manifest for performance, but the manifest is the authoritative source for capability self-description.

## Target Package Shape

Every canonical capability repo should converge to:

```
repo/
├── SKILL.md            # Human-readable skill instructions
├── capability.json     # Machine-readable manifest
├── scripts/            # Executable scripts
├── references/         # Reference docs, examples, templates
├── assets/             # Optional: static assets
└── examples/           # Optional: usage examples
```

## Current State: No Manifests Exist

None of the 5 canonical capability repos currently have `capability.json`. All repos will need manifest creation as part of Phase 2 normalization.
