# Capability Registry Schema

**Date:** 2026-04-03
**Phase:** 1 — Registry and Capability Contract

## Purpose

The registry is the source of truth inside `content-toolkit` for discovering, installing, updating, and routing capabilities. Each entry describes how the orchestrator can reach a capability without embedding business logic.

## Target Registry Entry Schema

```jsonc
{
  "id": "download",                          // unique capability identifier
  "name": "Content Downloader",              // human-readable name
  "kind": "first-party",                     // "first-party" | "external" | "legacy"
  "owner": "zinan92",                        // GitHub owner
  "repo": "zinan92/content-downloader",      // GitHub repo slug
  "primary_ref": "main",                     // branch or tag to install from
  "fallback_repo": null,                     // fallback repo slug (external only)
  "fallback_ref": null,                      // fallback branch or tag
  "skill_path": "SKILL.md",                  // path to skill doc within repo
  "entrypoint": "content-downloader download",// CLI execution command
  "install": {                               // install instructions
    "method": "git-clone",                   // "git-clone" | "npm-install" | "custom"
    "setup": "setup.sh",                     // optional post-clone setup script
    "python_deps": true,                     // whether to create venv + install
    "node_deps": false                       // whether to run npm install
  },
  "update": {                                // update instructions
    "method": "git-pull"                     // "git-pull" | "custom"
  },
  "dependencies": ["python3"],               // system-level dependencies
  "tags": ["download", "douyin", "xhs", "wechat", "x"],  // discovery tags
  "workflow_before": [],                     // capabilities that typically precede this
  "workflow_after": ["extract"],             // capabilities that typically follow this
  "status": "active"                         // "active" | "deprecated" | "planned"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique capability identifier, used as registry key |
| `name` | string | Human-readable display name |
| `kind` | enum | `first-party`, `external`, or `legacy` |
| `repo` | string | GitHub `owner/repo` slug |
| `primary_ref` | string | Branch or tag to install |
| `entrypoint` | string | CLI command to execute the capability |
| `install.method` | string | Installation method |
| `dependencies` | string[] | System-level requirements |
| `status` | enum | `active`, `deprecated`, or `planned` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `owner` | string | GitHub owner (derivable from `repo`) |
| `fallback_repo` | string | Fallback source for external capabilities |
| `fallback_ref` | string | Fallback branch or tag |
| `skill_path` | string | Path to SKILL.md within repo (default: `SKILL.md`) |
| `install.setup` | string | Post-clone setup script |
| `install.python_deps` | boolean | Whether to auto-create venv |
| `install.node_deps` | boolean | Whether to run npm install |
| `update.method` | string | Update method (default: `git-pull`) |
| `tags` | string[] | Discovery and routing tags |
| `workflow_before` | string[] | Predecessor capabilities in typical workflow |
| `workflow_after` | string[] | Successor capabilities in typical workflow |
| `subcommands` | string[] | Sub-capability commands (e.g., videocut) |

## Comparison with Current `registry.json`

### Fields That Already Exist

| Current Field | Maps To | Notes |
|---------------|---------|-------|
| `repo` | `repo` | Same semantics |
| `description` | `name` | Rename and add separate description |
| `stage` | `workflow_before` / `workflow_after` | Replace numeric stage with explicit edges |
| `requires` | `dependencies` | Same semantics, renamed |
| `entry` | `entrypoint` | Same semantics, renamed |
| `subcommands` | `subcommands` | Keep as-is |

### Fields to Add

| New Field | Reason |
|-----------|--------|
| `id` | Explicit key instead of relying on JSON object key |
| `kind` | Distinguish first-party from external capabilities |
| `primary_ref` | Pin to a specific branch/tag |
| `fallback_repo` / `fallback_ref` | Support fallback resolution |
| `skill_path` | Locate skill documentation |
| `install` (structured) | Richer than implicit clone-and-detect |
| `update` (structured) | Explicit update method |
| `tags` | Enable discovery beyond name matching |
| `workflow_before` / `workflow_after` | Replace numeric stage ordering |
| `status` | Track capability lifecycle |

### Fields to Deprecate

| Current Field | Reason |
|---------------|--------|
| `stage` (numeric) | Replaced by explicit workflow edges; numeric ordering is fragile |
| `description` (Chinese) | Move to `name`; keep descriptions in SKILL.md |

## Migration Path

1. Keep current `registry.json` working during transition
2. Create new `registry.v2.json` with the target schema
3. Update `install.js` to read from v2 format
4. Remove v1 format once all capabilities are normalized
