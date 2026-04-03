# Content Toolkit Conversion Strategy

**Date:** 2026-04-03
**Phase:** 4 Preparation — Rebuild Content Toolkit as True Orchestrator

## Current State

`content-toolkit` currently acts as:

1. **Business CLI surface** — `content download`, `content rewrite`, etc. route directly to capability CLIs
2. **Static registry** — `registry.json` with flat capability entries
3. **Lazy installer** — `install.js` clones repos on first use
4. **Path resolver** — resolves relative paths before delegating to capability CLIs

Key files:
- `cli.js` — 227 lines, routes commands to capabilities, handles path resolution
- `install.js` — 118 lines, clone/venv/update/remove logic
- `registry.json` — 5 capability entries with basic metadata
- `SKILL.md` — orchestrator routing documentation
- `workflows.js` — cross-capability workflow definitions (new, uncommitted)

## What Stays in Content Toolkit

### 1. Root Orchestrator Skill (`SKILL.md`)

The orchestrator skill document remains the routing brain. It tells Claude (or a human) how to interpret user intent and select the right capability. This is `content-toolkit`'s core value.

**Change:** Update to reference registry-driven routing instead of hard-coded stage assumptions.

### 2. Registry Reader and Capability Resolver

The registry is how the orchestrator discovers capabilities. Currently `loadRegistry()` reads `registry.json`.

**Change:** Evolve to read `registry.v2.json` with the richer schema (kind, fallback, install method, workflow edges).

### 3. Installer/Updater (`install.js`)

The lazy install model (clone on first use) is good. The current implementation handles git clone, venv creation, and pip install.

**Change:** Make install logic registry-driven:
- Read `install.method` from registry entry
- Support `git-clone` (current), `npm-install`, and `custom` methods
- Add `pinned_ref` support (currently always clones HEAD)
- Add fallback resolution for external capabilities

### 4. Local Cache Manager

The `capabilities/` directory is the local install cache.

**Change:** Add metadata tracking:
- `installed_ref` — what commit/tag is installed
- `installed_at` — timestamp
- `source` — primary or fallback
- `health` — last verification result

### 5. Workflow Chaining

`workflows.js` defines cross-capability chains. This is orchestrator logic.

**Change:** Make workflow definitions registry-aware. Use `workflow_before`/`workflow_after` edges from capability manifests to validate and suggest chains.

## What Leaves Content Toolkit (Conceptually)

Business execution logic should **not** live in the root toolkit. The following are already correctly delegated to capability repos:

| Domain | Current Location | Should Stay In |
|--------|-----------------|----------------|
| Download logic | `content-downloader` | `content-downloader` |
| Extraction logic | `content-extractor` | `content-extractor` |
| Rewriting logic | `content-rewriter` | `content-rewriter` |
| Video editing logic | `videocut` | `videocut` |
| Analysis logic | `content-intelligence` | `content-intelligence` |

**No code needs to be moved out.** The current architecture already delegates execution. The conversion is about making the orchestrator layer *aware* that it is an orchestrator, not a business CLI.

## Transition Strategy for Root CLI

**Decision:** Keep a thin compatibility wrapper while routing to registry-backed capabilities.

### Rationale

- Users already use `content download <url>` — breaking this is unnecessary
- The CLI is a routing layer, not business logic — it can remain as-is
- The real change is in how the CLI *discovers* and *installs* capabilities

### Transition Steps

1. **Phase 4a:** Create `registry.v2.json` alongside current `registry.json`
2. **Phase 4b:** Update `install.js` to read v2 format with backward compatibility
3. **Phase 4c:** Update `cli.js` to use v2 registry for routing
4. **Phase 4d:** Remove `registry.json` (v1) once all capabilities have manifests
5. **Phase 4e:** Update `SKILL.md` to reflect registry-driven routing

### What Does NOT Change

- Command syntax: `content <capability> [args]` stays the same
- Auto-install on first use stays the same
- Path resolution stays the same
- User-facing help output stays the same (content auto-generated from registry)

## Stop Conditions

- Do NOT start Phase 4 implementation before all 5 core repos have `capability.json` (Phase 2 complete)
- Do NOT remove `registry.json` v1 before v2 is validated
- Do NOT add business logic to `content-toolkit` during conversion
- Do NOT touch `content-workbench` as part of this conversion
