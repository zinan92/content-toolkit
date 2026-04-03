# Content Repo Classification

**Date:** 2026-04-03
**Phase:** 0 — Scope and Canonical Model

## Canonical Core Capabilities

These repos are the primary first-party capability layer. They will be normalized in Phase 2.

| Repo | Capability ID | Role | CLI Framework | Location |
|------|--------------|------|---------------|----------|
| `zinan92/content-downloader` | `download` | Unified content download (Douyin/XHS/WeChat/X) | Python Click | `~/work/content-co/content-downloader` |
| `zinan92/content-extractor` | `extract` | Multimodal content extraction (video/image/article) | Python Typer | `~/work/content-co/content-extractor` |
| `zinan92/content-rewriter` | `rewrite` | Cross-platform content rewriting | Python Typer | `~/work/content-co/content-rewriter` |
| `zinan92/videocut` | `videocut` | Video editing capability set (autocut/subtitle/hook/clip/cover/speed) | Bash + Node.js | `~/videocut` |
| `zinan92/content-intelligence` | `intelligence` | Content insight engine (trends/attribution/topic suggestions) | Python Click | `~/work/content-co/content-intelligence` |

## Orchestrator

| Repo | Role | Notes |
|------|------|-------|
| `zinan92/content-toolkit` | Orchestrator + registry + distribution layer | Currently acts as business CLI surface; should become pure orchestrator |

## Product Consumer

| Repo | Role | Notes |
|------|------|-------|
| `zinan92/content-workbench` | User-facing product/workbench | Consumer of capability system, not the system center |

## Legacy Predecessors

| Repo | Role | Notes |
|------|------|-------|
| `zinan92/douyin-downloader` | Legacy single-purpose download pipeline | Superseded by `content-downloader` |
| `zinan92/douyin-downloader-1` | Legacy or upstream source | Useful as implementation origin reference only |

## Future Capability Candidates

| Repo | Role | Notes |
|------|------|-------|
| `zinan92/seedance-expert` | Future generation capability | Already skill-first structure |
| `zinan92/AI-videos` | Future generation/production capability | Likely belongs in later generation domain |

## External Dependencies

| Repo | Current Use | Future Role |
|------|-------------|-------------|
| `dreammis/social-auto-upload` | Publish stage dependency | External capability pointer with optional fallback |
| `autoclaw-cc/xiaohongshu-skills` | Xiaohongshu stage dependency | External capability pointer with optional fallback |

## Phase-1 Exclusions

The following repos will **not** be modified in the first restructuring wave:

- `content-workbench` — product consumer, not part of capability system restructuring
- `seedance-expert` — future candidate, not yet in scope
- `AI-videos` — future candidate, not yet in scope
- `dreammis/social-auto-upload` — external dependency, onboarded in Phase 5
- `autoclaw-cc/xiaohongshu-skills` — external dependency, onboarded in Phase 5
- `douyin-downloader` — legacy, no modifications needed
- `douyin-downloader-1` — legacy, no modifications needed

## Unresolved Classification Decisions

### 1. `intelligence` vs `content-intelligence`

**Question:** Does `zinan92/intelligence` overlap with `zinan92/content-intelligence`? Should it be deprecated, merged, or kept as a separate domain?

**Recommendation:** `content-intelligence` is the canonical analysis capability. `intelligence` should be audited for unique functionality. If overlapping, deprecate `intelligence` and migrate any unique features into `content-intelligence`. If it serves a different domain (e.g., trading intelligence), reclassify it outside the content system.

**Action:** Defer to Phase 3 (Classify Legacy and Adjacent Repos). Do not modify either repo in Phase 1–2.

### 2. `douyin-downloader` and `douyin-downloader-1` Retention Strategy

**Question:** Should these repos be archived, deleted, or kept as read-only references?

**Recommendation:** Archive both as read-only. They contain implementation history useful for understanding `content-downloader`'s evolution. Do not invest in maintenance.

**Action:** Defer to Phase 3. No changes required now.
