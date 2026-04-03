# Content Toolkit Restructuring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the content capability system so `content-toolkit` becomes a true orchestrator over independent capability repos, with a registry-driven install/update model and support for external pointers plus fallback sources.

**Architecture:** Use a registry-first migration. First define canonical repo roles and the capability contract, then normalize the five core capability repos, then rebuild `content-toolkit` around orchestration and distribution responsibilities. Keep execution logic in capability repos and avoid moving domain business logic back into the toolkit.

**Tech Stack:** Markdown skills, JSON capability manifests, registry metadata, Node.js in `content-toolkit`, Python and Node CLIs in capability repos, GitHub repos as capability sources.

---

### Task 1: Create planning surface inside `content-toolkit`

**Files:**
- Create: `docs/plans/2026-04-03-content-toolkit-restructuring-design.md`
- Create: `docs/plans/2026-04-03-content-toolkit-restructuring-plan.md`
- Inspect: `/Users/wendy/content-toolkit/README.md`
- Inspect: `/Users/wendy/content-toolkit/SKILL.md`

**Step 1: Confirm the local repo root and current dirty files**

Run:
```bash
git -C /Users/wendy/content-toolkit status --short
```

Expected:
- local changes may exist in implementation files
- do not modify those files during the documentation pass

**Step 2: Create `docs/plans/` if missing**

Run:
```bash
mkdir -p /Users/wendy/content-toolkit/docs/plans
```

Expected:
- `docs/plans/` exists

**Step 3: Save the design document**

Write the approved restructuring design to:
```text
/Users/wendy/content-toolkit/docs/plans/2026-04-03-content-toolkit-restructuring-design.md
```

Expected sections:
- goal
- non-goals
- definitions
- repo classification
- target system model
- pointer/fallback policy
- restructuring phases

**Step 4: Save this implementation plan**

Write this plan to:
```text
/Users/wendy/content-toolkit/docs/plans/2026-04-03-content-toolkit-restructuring-plan.md
```

**Step 5: Commit documentation only**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans
git -C /Users/wendy/content-toolkit commit -m "docs: add content-toolkit restructuring design and plan"
```

Expected:
- only documentation files are committed
- pre-existing dirty files remain untouched

### Task 2: Define canonical repo roles and exclusions

**Files:**
- Modify: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-content-toolkit-restructuring-design.md`
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-content-repo-classification.md`

**Step 1: Create a repo classification matrix**

Document every relevant repo in one of these buckets:
- canonical capability
- orchestrator
- product consumer
- legacy predecessor
- upstream source
- future capability candidate
- external dependency

Include at minimum:
- `zinan92/content-downloader`
- `zinan92/content-extractor`
- `zinan92/content-intelligence`
- `zinan92/content-rewriter`
- `zinan92/videocut`
- `zinan92/content-toolkit`
- `zinan92/content-workbench`
- `zinan92/douyin-downloader`
- `zinan92/douyin-downloader-1`
- `zinan92/intelligence`
- `zinan92/seedance-expert`
- `zinan92/AI-videos`

**Step 2: Mark phase-1 exclusions**

Explicitly mark which repos will not be modified in the first restructuring wave:
- `content-workbench`
- `seedance-expert`
- `AI-videos`
- any third-party dependency repo

**Step 3: Record unresolved classification decisions**

Document open decisions for:
- `intelligence` vs `content-intelligence`
- `douyin-downloader` and `douyin-downloader-1` retention strategy

**Step 4: Commit the classification doc**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans/2026-04-03-content-repo-classification.md
git -C /Users/wendy/content-toolkit commit -m "docs: classify content capability repos"
```

### Task 3: Design the registry schema and capability manifest contract

**Files:**
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-capability-registry-schema.md`
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-capability-manifest-schema.md`
- Inspect: `/Users/wendy/content-toolkit/registry.json`

**Step 1: Document the target registry entry schema**

Define the required fields for a registry entry:
- `id`
- `kind`
- `owner`
- `repo`
- `primary_ref`
- `fallback_repo`
- `fallback_ref`
- `skill_path`
- `entrypoint`
- `install`
- `update`
- `dependencies`
- `tags`
- `workflow_before`
- `workflow_after`
- `status`

**Step 2: Document the per-capability manifest schema**

Define the required fields for `capability.json` that will live inside each capability repo.

At minimum include:
- identity
- entrypoint
- install/update commands
- input and output types
- bundled resource locations
- supported workflow edges

**Step 3: Compare current `registry.json` to the target schema**

Document:
- fields that already exist
- fields to add
- fields to deprecate

**Step 4: Commit both schema docs**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans/2026-04-03-capability-registry-schema.md docs/plans/2026-04-03-capability-manifest-schema.md
git -C /Users/wendy/content-toolkit commit -m "docs: define capability registry and manifest schema"
```

### Task 4: Normalize the five canonical capability repos on paper before code

**Files:**
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-core-capability-normalization.md`

**Step 1: Create one normalization checklist per core repo**

For each repo:
- `zinan92/content-downloader`
- `zinan92/content-extractor`
- `zinan92/content-rewriter`
- `zinan92/videocut`
- `zinan92/content-intelligence`

Document the target package shape:
```text
SKILL.md
capability.json
scripts/
references/
assets/      # optional
examples/    # optional
```

**Step 2: Document gaps for each repo**

For each repo, record:
- whether `SKILL.md` exists
- whether `scripts/` exists
- whether `references/` exists
- whether `assets/` exists
- whether a machine-readable manifest exists
- whether the repo already has a stable CLI

**Step 3: Record repo-specific notes**

Examples:
- `videocut` already has internal sub-capability structure and should not be flattened
- `content-intelligence` still assumes older downloader sources and will need ingestion-boundary cleanup
- `content-rewriter` already looks close to the target contract

**Step 4: Commit the normalization doc**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans/2026-04-03-core-capability-normalization.md
git -C /Users/wendy/content-toolkit commit -m "docs: define core capability normalization checklist"
```

### Task 5: Plan the `content-toolkit` repo conversion

**Files:**
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-content-toolkit-conversion.md`
- Inspect: `/Users/wendy/content-toolkit/SKILL.md`
- Inspect: `/Users/wendy/content-toolkit/registry.json`
- Inspect: `/Users/wendy/content-toolkit/install.js`
- Inspect: `/Users/wendy/content-toolkit/cli.js`

**Step 1: Define what stays in `content-toolkit`**

Document the intended long-term ownership of:
- root orchestrator skill
- registry reader
- capability resolver
- installer/updater
- local cache manager

**Step 2: Define what leaves the toolkit conceptually**

Document that business execution should not live in the root toolkit for:
- download
- extract
- analyze
- rewrite
- videocut

**Step 3: Define the transition strategy for the current root CLI**

Decide one of these options and record it:
- deprecate the root business CLI over time
- keep a thin compatibility wrapper while routing to registry-backed capabilities

**Step 4: Commit the conversion doc**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans/2026-04-03-content-toolkit-conversion.md
git -C /Users/wendy/content-toolkit commit -m "docs: define content-toolkit conversion strategy"
```

### Task 6: Design pointer and fallback policy for external repos

**Files:**
- Create: `/Users/wendy/content-toolkit/docs/plans/2026-04-03-pointer-fallback-policy.md`

**Step 1: Define pointer policy**

Document that external capabilities should default to:
- pointer to source repo
- pinned ref
- local cache install

**Step 2: Define fallback eligibility**

A fallback mirror or fork is recommended only when:
- the capability is critical
- the source repo is external
- failure would block a primary workflow

**Step 3: Define resolution order**

Document the exact order:
1. primary repo + pinned ref
2. fallback repo + fallback ref
3. local last-known-good cache

**Step 4: Identify current external dependencies**

At minimum include:
- `dreammis/social-auto-upload`
- `autoclaw-cc/xiaohongshu-skills`

**Step 5: Commit the fallback policy**

Run:
```bash
git -C /Users/wendy/content-toolkit add docs/plans/2026-04-03-pointer-fallback-policy.md
git -C /Users/wendy/content-toolkit commit -m "docs: define pointer and fallback policy"
```

---

## Phase-by-Phase Execution Order

### Phase 0: Scope and Canonical Model — COMPLETED

**Status:** Done (Tasks 1–2)

**Deliverables:**
- [x] `2026-04-03-content-toolkit-restructuring-design.md` — system model, definitions, risks
- [x] `2026-04-03-content-repo-classification.md` — repo roles, exclusions, unresolved decisions

**Decisions locked:**
- 5 canonical capabilities: download, extract, rewrite, videocut, intelligence
- 1 orchestrator: content-toolkit
- 1 product consumer: content-workbench (excluded from wave 1)
- 2 legacy repos: douyin-downloader, douyin-downloader-1 (deferred to Phase 3)
- 2 future candidates: seedance-expert, AI-videos (excluded from wave 1)
- 2 external deps: social-auto-upload, xiaohongshu-skills (deferred to Phase 5)

---

### Phase 1: Registry and Capability Contract — COMPLETED

**Status:** Done (Tasks 3–6)

**Deliverables:**
- [x] `2026-04-03-capability-registry-schema.md` — registry entry schema, migration path from v1
- [x] `2026-04-03-capability-manifest-schema.md` — per-repo `capability.json` contract
- [x] `2026-04-03-core-capability-normalization.md` — gap analysis for all 5 core repos
- [x] `2026-04-03-content-toolkit-conversion.md` — what stays/leaves toolkit, transition strategy
- [x] `2026-04-03-pointer-fallback-policy.md` — pointer-first default, fallback eligibility, resolution order

---

### Phase 2: Canonicalize Core Capability Repos — IN PROGRESS

**Goal:** Bring 5 core repos to the shared package structure defined in Phase 1.

**Repo execution order:**

| Order | Repo | Why this order |
|-------|------|---------------|
| 1 | `zinan92/content-rewriter` | Closest to target; serves as pilot template |
| 2 | `zinan92/content-downloader` | Clear I/O contract, adapter pattern |
| 3 | `zinan92/content-extractor` | Well-documented architecture |
| 4 | `zinan92/content-intelligence` | Needs ingestion boundary review |
| 5 | `zinan92/videocut` | Most complex (compound capability); normalize last |

**Per-repo deliverables:**

For each repo, create:
- `SKILL.md` — human-readable skill doc with routing, I/O, examples
- `capability.json` — machine-readable manifest per schema
- `references/` — platform docs, templates, style guides
- `scripts/` — if standalone helper scripts exist (or document CLI-only surface)
- `examples/` — optional usage examples

Per-repo commit: `feat: add capability contract (SKILL.md + capability.json)`

**Stop conditions:**
- Do NOT modify business logic or CLI behavior
- Do NOT move code between repos
- Do NOT create `registry.v2.json` yet (that's Phase 4)
- Do NOT touch `content-workbench`

**Exit criteria:**
- All 5 repos have `SKILL.md` + `capability.json`
- All manifests validate against the schema in `2026-04-03-capability-manifest-schema.md`
- All existing CLIs still work unchanged

---

### Phase 3: Classify Legacy and Adjacent Repos

**Goal:** Resolve the open classification decisions from Phase 0.

**Repo targets:**
- `zinan92/intelligence` — audit for overlap with `content-intelligence`; decide keep/merge/deprecate
- `zinan92/douyin-downloader` — archive as read-only reference
- `zinan92/douyin-downloader-1` — archive as read-only reference

**Deliverables:**
- Legacy retention plan document
- Migration notes for overlapping repos
- GitHub repo descriptions updated to reflect status (archived/deprecated)

**Stop conditions:**
- Do NOT delete any repo without explicit user approval
- Do NOT merge code between repos in this phase — only document the plan

**Exit criteria:**
- Every content-related repo under `zinan92` has an explicit role assignment
- No ambiguous overlaps remain

---

### Phase 4: Rebuild Content Toolkit as True Orchestrator

**Goal:** Refactor `content-toolkit` internals around the registry and distribution model.

**Repo target:** `zinan92/content-toolkit`

**Deliverables:**

| Step | What | Files |
|------|------|-------|
| 4a | Create `registry.v2.json` from capability manifests | `registry.v2.json` |
| 4b | Update `install.js` to read v2 format | `install.js` |
| 4c | Update `cli.js` to route via v2 registry | `cli.js` |
| 4d | Add install metadata tracking | `capabilities/.meta/` |
| 4e | Update `SKILL.md` to reflect registry-driven routing | `SKILL.md` |
| 4f | Remove `registry.json` v1 | `registry.json` (delete) |

**Stop conditions:**
- Do NOT start before Phase 2 is complete (all 5 repos have manifests)
- Do NOT break `content <capability> [args]` command syntax
- Do NOT add business logic to toolkit
- Maintain backward compat with v1 registry until v2 is validated

**Exit criteria:**
- `content list` reads from v2 registry
- `content install/update/remove` use v2 install methods
- All 5 capabilities install and run correctly via v2 path
- v1 `registry.json` removed

---

### Phase 5: External Capability Onboarding

**Goal:** Add external repos to the registry with pointer and fallback semantics.

**Repo targets:**
- `dreammis/social-auto-upload` — pointer + fallback mirror
- `autoclaw-cc/xiaohongshu-skills` — pointer only

**Deliverables:**
- External capability entries in `registry.v2.json`
- Fallback fork created: `zinan92/social-auto-upload` (mirror)
- Fallback resolution logic in `install.js`
- Cache metadata files for installed external capabilities

**Stop conditions:**
- Do NOT start before Phase 4 is complete (v2 registry working)
- Do NOT start before pointer/fallback policy is approved (done in Phase 1)
- Fallback forks must be mirrors, not feature-divergent

**Exit criteria:**
- External capabilities discoverable via `content list`
- `content install <external>` works with pointer resolution
- Fallback triggers correctly when primary source is unavailable

---

### Phase 6: Workflow Validation

**Goal:** Validate the full system against real cross-capability chains.

**Test chains:**
1. `download → extract → rewrite` (core content repurposing)
2. `download → videocut pipeline` (video production)
3. `intelligence → download → extract → rewrite` (full discovery-to-publish)
4. `videocut → publish` (video-to-social with external capability)

**Deliverables:**
- Orchestrator acceptance tests (can be manual CLI walkthroughs or scripted)
- Capability-chain smoke test scripts in `content-toolkit/tests/`
- Documented dogfooding flows

**Stop conditions:**
- Do NOT start before Phase 5 is complete
- Do NOT automate tests that require paid API calls without user approval

**Exit criteria:**
- All 4 test chains complete successfully
- No hard-coded stage assumptions remain in toolkit
- Registry is the single source of truth for capability discovery

---

## Global Exclusions (All Phases)

- `content-workbench` — not modified in any phase
- `seedance-expert`, `AI-videos` — future candidates, not in scope
- No monorepo merges
- No business logic moved back into `content-toolkit`
- Pre-existing dirty files in any repo preserved
