# Content Toolkit Restructuring Design

**Date:** 2026-04-03

## Goal

Restructure the content toolchain from a mixed "CLI wrapper + embedded skill docs + external repos" model into a registry-driven capability system with a clear separation between:

- capability skills
- orchestrator skill
- distribution and update layer

The target system should let `content-toolkit` orchestrate:

- first-party content capabilities under `zinan92/*`
- third-party capability repos via pointer-style registry entries
- fallback mirrors for critical external dependencies

## Non-Goals

- Rewriting every capability implementation in this pass
- Merging all content repos into a monorepo
- Removing all CLI/script execution surfaces from capability repos
- Turning `content-workbench` into the system orchestrator

## Core Definitions

### Capability Skill

A capability skill is an independently usable unit that owns one domain action, such as download, extract, rewrite, analyze, or videocut.

It should package:

- `SKILL.md`
- `scripts/`
- `references/`
- `assets/` when needed
- a machine-readable manifest such as `capability.json`

It may expose a CLI, scripts, or both. Its execution surface must remain stable and testable without requiring the orchestrator.

### Orchestrator Skill

An orchestrator skill does not own business execution logic. Its job is to:

- understand user intent
- identify the current workflow stage
- select the correct capability
- chain multiple capabilities
- recommend the next step

In this system, `content-toolkit` becomes an orchestrator skill.

### Registry Entry

A registry entry is the system contract between the orchestrator and a capability source. It records:

- identity
- repo source
- pinned version or ref
- fallback source
- install and update method
- skill path
- execution entrypoint
- dependencies
- domain tags
- workflow edges

### Distribution Layer

The distribution layer is separate from skill definition. It handles:

- pointer resolution
- installation
- update
- version pinning
- fallback switching
- local cache management

This layer belongs to `content-toolkit`, but it is not the same thing as the orchestrator skill body.

## Design Principles

1. `content-toolkit` is an orchestrator, not a business-capability CLI.
2. Core business execution lives in capability repos, not in the root toolkit repo.
3. Capability repos must remain independently executable.
4. Registry is the source of truth for discovery, install, and routing.
5. Pointer-first is the default distribution strategy.
6. Critical external repos may define fallback mirrors or forks.
7. Repo roles must be explicit: canonical capability, orchestrator, product consumer, legacy source, or future candidate.

## Current Repo Classification

### Canonical Core Capabilities

These repos should become the primary first-party capability layer:

| Repo | Canonical Role | Notes |
|---|---|---|
| `zinan92/content-downloader` | download capability | already has strong input/output contract and CLI |
| `zinan92/content-extractor` | extract capability | already supports bare-file and content-item directory flows |
| `zinan92/content-rewriter` | rewrite capability | already trends toward a clean capability repo |
| `zinan92/videocut` | videocut capability | already contains internal sub-capability structure |
| `zinan92/content-intelligence` | analyze capability | should become canonical over older analysis variants |

### Orchestrator

| Repo | Role | Notes |
|---|---|---|
| `zinan92/content-toolkit` | orchestrator + registry + distribution layer | should stop being the primary business CLI surface |

### Product Consumer

| Repo | Role | Notes |
|---|---|---|
| `zinan92/content-workbench` | user-facing product/workbench | consumer of capability system, not the system center |

### Legacy, Upstream, or Reference Repos

| Repo | Proposed Role | Notes |
|---|---|---|
| `zinan92/douyin-downloader` | legacy predecessor | old single-purpose pipeline |
| `zinan92/douyin-downloader-1` | legacy or upstream source | useful as implementation origin, not canonical center |
| `zinan92/intelligence` | overlapping analysis line | requires explicit keep/merge/deprecate decision |

### Future Capability Candidates

| Repo | Proposed Role | Notes |
|---|---|---|
| `zinan92/seedance-expert` | future generation capability | already skill-first |
| `zinan92/AI-videos` | future generation/production capability | likely belongs in later generation domain |

### Current External Capability Sources

| Repo | Current Use | Future Role |
|---|---|---|
| `dreammis/social-auto-upload` | publish stage dependency | external capability pointer with optional fallback |
| `autoclaw-cc/xiaohongshu-skills` | xiaohongshu stage dependency | external capability pointer with optional fallback |

## Target System Model

### Layer 1: Capability Repos

Each canonical capability repo becomes a self-contained package with:

- human-readable skill instructions
- machine-readable manifest
- deterministic scripts or CLI
- local references and assets

These repos should not depend on `content-toolkit` for normal execution.

### Layer 2: Content Toolkit

`content-toolkit` should own three things:

- root orchestrator skill
- capability registry
- distribution tooling

It should not become the primary home of:

- download logic
- extraction logic
- rewriting logic
- video editing logic
- analysis logic

### Layer 3: Local Installed State

Installed capability repos should live in a local cache area, with metadata for:

- installed ref
- source repo
- fallback status
- health state
- last verified timestamp

The current `capabilities/` folder can continue as a cache implementation, but it should become a runtime install area rather than a conceptual source-of-truth directory.

## Capability Contract Direction

Each canonical capability repo should converge toward a shared packaging pattern:

```text
repo/
├── SKILL.md
├── capability.json
├── scripts/
├── references/
├── assets/           # optional
└── examples/         # optional
```

Suggested minimum `capability.json` fields:

- `id`
- `name`
- `kind`
- `repo`
- `entrypoint`
- `skill_path`
- `install`
- `update`
- `dependencies`
- `input_types`
- `output_types`
- `tags`
- `workflow_before`
- `workflow_after`

## Pointer and Fallback Policy

### Default

Use pointer-style registry entries to external repos whenever possible.

### When to Add a Fallback Mirror

Add a fallback mirror or fork when all of the following are true:

- the capability is on a critical workflow path
- upstream instability would break a high-value use case
- the repo is not under your direct control

### Recommended Fallback Strategy

Each registry entry may define:

- `primary_repo`
- `pinned_ref`
- `fallback_repo`
- `cache_policy`
- `last_known_good_ref`

Resolution order:

1. install from primary repo at pinned ref
2. if primary fails, use fallback repo
3. if fallback fails, use local last-known-good cache

### Important Constraint

Fallback forks should begin as mirrors, not feature-divergent forks. A fallback is a continuity mechanism, not a second primary implementation.

## What Changes in Content Toolkit

### Keep

- root `SKILL.md` as orchestrator center
- install/update/remove/discovery logic, but refactor it around registry entries
- runtime install/cache directory

### Change

- move away from "root business CLI as the canonical interface"
- stop treating child capabilities as only a static registry table
- make registry schema richer than current `registry.json`
- make orchestrator logic registry-driven instead of hard-coded stage assumptions

### Remove Over Time

- hard-coded capability assumptions that belong in capability manifests
- embedded business semantics that are duplicated across child repos

## Restructuring Phases

### Phase 0: Scope and Canonical Model

Define canonical repo roles and freeze the scope of the first restructuring wave.

Output:

- repo role table
- canonical capability list
- explicit exclusions for phase 1

### Phase 1: Registry and Capability Contract

Define the machine-readable contract that lets `content-toolkit` discover, install, update, and route capabilities consistently.

Output:

- registry schema
- capability manifest schema
- pointer and fallback policy

### Phase 2: Canonicalize Core Capability Repos

Bring the five core capability repos to a shared package structure and shared contract shape.

Output:

- `SKILL.md` plus bundled resources in each core repo
- `capability.json` in each core repo
- documented execution surfaces

### Phase 3: Classify Legacy and Adjacent Repos

Decide which repos are canonical, legacy, upstream, or future candidates.

Output:

- legacy retention plan
- migration notes for overlapping repos
- future-domain intake backlog

### Phase 4: Rebuild Content Toolkit as True Orchestrator

Refactor `content-toolkit` around the registry and distribution model.

Output:

- orchestrator-first root skill
- registry reader and resolver
- install/update/health tooling

### Phase 5: External Capability Onboarding

Add support for external repos with pointer and fallback semantics.

Output:

- external capability templates
- fallback policy implementation
- trust and health workflow

### Phase 6: Workflow Validation

Validate the system against real cross-capability chains.

Output:

- orchestrator acceptance checks
- capability-chain smoke tests
- documented dogfooding flows

## Recommended Execution Order

Use a registry-first sequence:

1. define system model and repo roles
2. define registry and capability contract
3. normalize core capability repos
4. refactor `content-toolkit`
5. onboard external repos
6. validate end-to-end workflows

This order minimizes rework and keeps future domains such as slides, remotion, and frontend capabilities compatible with the same system model.

## Risks

### Risk 1: Rebuilding the orchestrator before the capability contract is stable

Consequence:

`content-toolkit` becomes another temporary wrapper and must be rewritten again.

### Risk 2: Keeping overlapping analysis/downloader lines unresolved

Consequence:

Future registry entries become ambiguous and orchestration logic gets duplicated.

### Risk 3: Mixing skill definition with distribution logic

Consequence:

The system becomes hard to reason about and impossible to update cleanly.

### Risk 4: Treating every external repo as equally critical

Consequence:

Unnecessary fallback forks increase maintenance cost.

## Immediate Next Step

Write the implementation plan for phases 0 through 6 as a concrete multi-repo execution document, with exact artifacts, repo targets, and sequencing for Claude Code to follow.
