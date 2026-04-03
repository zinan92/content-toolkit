# Core Capability Normalization Checklist

**Date:** 2026-04-03
**Phase:** 2 Preparation — Canonicalize Core Capability Repos

## Target Package Shape

Every canonical capability repo should have:

```
repo/
├── SKILL.md            # Human-readable skill instructions
├── capability.json     # Machine-readable manifest (per schema doc)
├── scripts/            # Executable scripts
├── references/         # Reference docs, templates
├── assets/             # Optional: static assets
└── examples/           # Optional: usage examples
```

---

## 1. `zinan92/content-downloader`

**Location:** `~/work/content-co/content-downloader`
**CLI:** Python Click (`content-downloader download`)
**Python:** 3.11+

### Current State

| Artifact | Exists | Notes |
|----------|--------|-------|
| `SKILL.md` | No | Has README.md and minimal CLAUDE.md |
| `capability.json` | No | — |
| `scripts/` | No | CLI is via Click command group |
| `references/` | No | — |
| `assets/` | No | — |
| `examples/` | No | — |
| Stable CLI | Yes | `content-downloader download <url>` |

### Gaps to Close

- [ ] Create `SKILL.md` with routing instructions, input/output contract, platform adapters
- [ ] Create `capability.json` per manifest schema
- [ ] Create `scripts/` if there are standalone helper scripts (or document that CLI is the only surface)
- [ ] Create `references/` for platform-specific documentation (cookies, URL patterns)
- [ ] Verify CLI entrypoint matches registry expectation

### Repo-Specific Notes

- Uses adapter pattern for platform-specific downloaders (Douyin, XHS, WeChat, X)
- Douyin requires cookies for authentication — this is a runtime dependency, not an install dependency
- Output is a structured content directory, which is the input contract for `content-extractor`

---

## 2. `zinan92/content-extractor`

**Location:** `~/work/content-co/content-extractor`
**CLI:** Python Typer
**Python:** 3.13+

### Current State

| Artifact | Exists | Notes |
|----------|--------|-------|
| `SKILL.md` | No | Has excellent CLAUDE.md with detailed architecture |
| `capability.json` | No | — |
| `scripts/` | No | — |
| `references/` | No | — |
| `assets/` | No | — |
| `examples/` | No | — |
| Stable CLI | Yes | `content-extractor extract <dir>` |

### Gaps to Close

- [ ] Create `SKILL.md` (can derive from existing CLAUDE.md)
- [ ] Create `capability.json` per manifest schema
- [ ] Create `references/` for supported input formats and output schemas
- [ ] Verify CLI entrypoint matches registry expectation

### Repo-Specific Notes

- Supports two input flows: bare-file and content-item directory
- Uses `src/` layout (`src/content_extractor/`)
- Depends on Whisper for audio/video transcription
- Output is `extractor_output.json`, which is input for `content-rewriter`

---

## 3. `zinan92/content-rewriter`

**Location:** `~/work/content-co/content-rewriter`
**CLI:** Python Typer
**Python:** 3.13+

### Current State

| Artifact | Exists | Notes |
|----------|--------|-------|
| `SKILL.md` | No | Has README.md |
| `capability.json` | No | — |
| `scripts/` | No | — |
| `references/` | No | — |
| `assets/` | No | — |
| `examples/` | No | — |
| Stable CLI | Yes | `content-rewriter rewrite` |

### Gaps to Close

- [ ] Create `SKILL.md` with platform-specific rewriting instructions
- [ ] Create `capability.json` per manifest schema
- [ ] Create `references/` for platform style guides and rewriting templates
- [ ] Verify CLI entrypoint matches registry expectation

### Repo-Specific Notes

- Already closest to the target capability contract shape
- Uses Claude API for LLM-powered rewriting
- Supports multiple output platforms (XHS, WeChat, X)
- Uses adapter pattern for platform-specific style adaptation
- 35 tests, 89% coverage as of 2026-03-30

---

## 4. `zinan92/videocut`

**Location:** `~/videocut`
**CLI:** Bash scripts + Node.js (`node cli.js`)
**Runtime:** Node.js + FFmpeg + Whisper + Claude CLI

### Current State

| Artifact | Exists | Notes |
|----------|--------|-------|
| `SKILL.md` | No | Has CLAUDE.md with sub-capability docs |
| `capability.json` | No | — |
| `scripts/` | No | Uses bash scripts at repo root |
| `references/` | No | — |
| `assets/` | No | — |
| `examples/` | No | — |
| Stable CLI | Yes | `node cli.js <subcommand>` |

### Gaps to Close

- [ ] Create `SKILL.md` with sub-capability routing and pipeline order
- [ ] Create `capability.json` with subcommand definitions per manifest schema
- [ ] Organize scripts into `scripts/` directory (or document current layout)
- [ ] Create `references/` for pipeline documentation

### Repo-Specific Notes

- **Compound capability** with 8 sub-capabilities: transcribe, autocut, subtitle, hook, clip, cover, speed, pipeline
- Already has internal sub-capability structure — do NOT flatten this
- Has a React web dashboard (`localhost:3789` + `localhost:5173`)
- Pipeline ordering matters: `autocut → speed → subtitle → hook → clip → cover`
- Most complex capability — normalization should be careful not to break existing workflows

---

## 5. `zinan92/content-intelligence`

**Location:** `~/work/content-co/content-intelligence`
**CLI:** Python Click (`python3 -m content_intelligence`)
**Python:** 3.11+

### Current State

| Artifact | Exists | Notes |
|----------|--------|-------|
| `SKILL.md` | No | Has minimal CLAUDE.md |
| `capability.json` | No | — |
| `scripts/` | No | — |
| `references/` | No | — |
| `assets/` | No | — |
| `examples/` | No | — |
| Stable CLI | Yes | `python3 -m content_intelligence` |

### Gaps to Close

- [ ] Create `SKILL.md` with analysis capabilities and output format
- [ ] Create `capability.json` per manifest schema
- [ ] Create `references/` for data source documentation
- [ ] Verify CLI entrypoint matches registry expectation

### Repo-Specific Notes

- Uses adapter pattern for data sources
- May still reference older downloader source patterns — needs ingestion-boundary cleanup
- Overlaps with `zinan92/intelligence` — resolution deferred to Phase 3
- Positioned as stage 1 (intelligence/discovery) in the content pipeline

---

## Normalization Priority Order

Recommended order for Phase 2 execution:

1. **content-rewriter** — closest to target, good test case
2. **content-downloader** — clear input/output contract
3. **content-extractor** — well-documented architecture
4. **content-intelligence** — needs ingestion boundary review
5. **videocut** — most complex, normalize last

## Shared Normalization Steps

For each repo:

1. Create `SKILL.md` from existing docs (README, CLAUDE.md)
2. Create `capability.json` per manifest schema
3. Create `scripts/` and `references/` directories as needed
4. Verify CLI entrypoint matches what the registry expects
5. Commit with message: `feat: add capability contract (SKILL.md + capability.json)`
