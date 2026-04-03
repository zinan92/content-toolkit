# Pointer and Fallback Policy

**Date:** 2026-04-03
**Phase:** 1 — Registry and Capability Contract

## Pointer Policy (Default)

External capabilities should default to **pointer-style** registry entries:

- Point to the source repo via `repo` field
- Pin to a specific ref (branch or tag) via `primary_ref`
- Install into the local `capabilities/` cache on first use
- No forking or mirroring unless fallback criteria are met

### Why Pointer-First

- Minimizes maintenance burden — upstream changes flow automatically on update
- Avoids fork drift — forks that diverge from upstream become a second codebase to maintain
- Keeps the registry lightweight — entries are metadata, not code

## Fallback Eligibility

A fallback mirror or fork is recommended **only** when ALL of the following are true:

1. **Critical path:** The capability is on a primary workflow path (e.g., publish stage)
2. **External ownership:** The source repo is not under `zinan92` control
3. **Blocking failure:** If upstream goes down or introduces a breaking change, a high-value workflow breaks with no workaround

### Decision Matrix

| Condition | Pointer Only | Pointer + Fallback |
|-----------|-------------|-------------------|
| First-party repo (`zinan92/*`) | Always | Never needed |
| External, non-critical path | Yes | No |
| External, critical path, stable upstream | Yes | Optional |
| External, critical path, unstable upstream | Yes | **Recommended** |

## Resolution Order

When the orchestrator needs to install or update a capability:

```
1. Primary repo at pinned ref
   ↓ (if clone/pull fails)
2. Fallback repo at fallback ref
   ↓ (if fallback also fails)
3. Local last-known-good cache
```

### Behavior at Each Step

| Step | Action | On Success | On Failure |
|------|--------|------------|------------|
| 1. Primary | `git clone --depth 1 --branch <primary_ref> <repo>` | Use installed copy | Try step 2 |
| 2. Fallback | `git clone --depth 1 --branch <fallback_ref> <fallback_repo>` | Use installed copy, log warning | Try step 3 |
| 3. Cache | Use existing `capabilities/<name>/` directory | Use cached copy, log warning | Fail with clear error |

### Important Constraints

- **Fallback forks must begin as mirrors**, not feature-divergent forks
- A fallback is a continuity mechanism, not a second primary implementation
- If upstream is consistently broken, the correct action is to either contribute a fix or promote the fork to primary — not to silently diverge

## Current External Dependencies

### 1. `dreammis/social-auto-upload`

| Field | Value |
|-------|-------|
| Current use | Publish stage — upload content to social platforms |
| Critical path? | Yes (publish is a terminal workflow step) |
| Upstream stability | Moderate — active development, occasional breaking changes |
| Fallback recommendation | **Recommended** — fork to `zinan92/social-auto-upload` as mirror |

### 2. `autoclaw-cc/xiaohongshu-skills`

| Field | Value |
|-------|-------|
| Current use | Xiaohongshu-specific operations |
| Critical path? | Partial — only affects XHS platform workflows |
| Upstream stability | Stable — maintained by known team |
| Fallback recommendation | **Optional** — pointer-only is acceptable for now |

## Registry Entry Examples

### External with Fallback

```json
{
  "id": "publish",
  "kind": "external",
  "repo": "dreammis/social-auto-upload",
  "primary_ref": "main",
  "fallback_repo": "zinan92/social-auto-upload",
  "fallback_ref": "mirror",
  "status": "active"
}
```

### External Without Fallback

```json
{
  "id": "xiaohongshu-skills",
  "kind": "external",
  "repo": "autoclaw-cc/xiaohongshu-skills",
  "primary_ref": "main",
  "fallback_repo": null,
  "fallback_ref": null,
  "status": "active"
}
```

## Cache Metadata

Each installed capability should track:

```json
{
  "installed_ref": "abc1234",
  "installed_at": "2026-04-03T10:00:00Z",
  "source": "primary",
  "last_verified": "2026-04-03T10:00:00Z",
  "health": "ok"
}
```

This enables:
- Knowing whether an update is available
- Detecting if we're running from fallback or primary
- Reporting stale installations
