# New Capability Onboarding Checklist

**Date:** 2026-04-07
**Audience:** Maintainer adding a new first-party or external capability to `content-toolkit`
**Purpose:** Add new capabilities without weakening the orchestrator/capability boundary.

---

## Goal

Every new capability added to `content-toolkit` should:

- fit the registry model cleanly
- stay independently executable
- expose clear health and install behavior
- avoid pushing business logic back into the orchestrator

---

## 1. Classify the Capability First

Before touching the registry, decide which class it belongs to:

- `first-party canonical capability`
- `external pointer capability`
- `reference-only capability`
- `future/experimental capability`

**Do not proceed** until this classification is explicit.

This decision affects:

- trust level
- fallback policy
- health expectations
- whether the capability should be runnable

---

## 2. Confirm Capability Shape

For a first-party capability, verify the repo has:

- `SKILL.md`
- `capability.json`
- `references/`

Optional but useful:

- `assets/`
- `examples/`
- `scripts/`

For an external capability, verify at minimum:

- repo is reachable
- entrypoint or reference-only role is known
- install method is understood
- pinned ref can be chosen intentionally

---

## 3. Confirm Execution Boundary

Ask these questions:

- Can this capability run outside `content-toolkit`?
- Does it own its own CLI or execution surface?
- Would it still make sense as a standalone repo?

If the answer is no, it probably is not ready to be onboarded as a capability.

---

## 4. Define Registry Entry

Add or update the entry in:

- `/Users/wendy/content-toolkit/registry.v2.json`

Minimum fields to confirm:

- `id`
- `name`
- `kind`
- `repo`
- `primary_ref`
- `skill_path`
- `entrypoint`
- `dependencies`
- `tags`
- `workflow_before`
- `workflow_after`
- `status`

External capabilities should also define or intentionally omit:

- `trust`
- `fallback_repo`
- `fallback_ref`
- `known_issues`

---

## 5. Decide Fallback Posture

Use the pointer/fallback policy, not intuition.

**Pointer-only is fine when**

- the capability is first-party
- or it is external but non-critical

**Fallback is recommended when**

- the capability is external
- it is on a critical path
- upstream instability would break a high-value workflow

If fallback is not configured, record that as an intentional decision.

---

## 6. Define Health Expectations

Before install logic is written, decide what “healthy” means.

Examples:

- entrypoint exists
- install completed successfully
- dependency environment exists
- reference-only capability is installed but not runnable
- known issues downgrade health instead of causing hidden failure

The capability must show up sensibly in:

- `content list`
- `content health`

---

## 7. Install Through the Toolkit

Do not treat manual clone success as onboarding success.

Use the toolkit path:

```bash
cd /Users/wendy/content-toolkit
node cli.js install <capability-id>
node cli.js health
```

**Check**

- install metadata is written to `capabilities/.meta/`
- source is recorded correctly
- health status is understandable

---

## 8. Validate Invocation Rules

If the capability is runnable:

- verify the entrypoint resolves correctly
- verify the toolkit can guard against malformed invocation
- verify capability-specific logic remains inside the capability repo

If the capability is reference-only:

- verify install works
- verify health works
- verify the toolkit does not try to run it like a normal business capability

---

## 9. Validate Workflow Position

Confirm the capability's declared workflow edges are true in practice.

Ask:

- What usually comes before this capability?
- What usually comes after it?
- Is it terminal, intermediate, or reference-only?

If the answer is fuzzy, do not overfit the workflow metadata yet. Keep it minimal.

---

## 10. Document Known Issues and Trust

If the capability is imperfect, record it honestly.

Good examples:

- install bug in upstream repo
- external repo is unverified
- capability is reference-only
- credential requirements not bundled with repo

Do not hide these in operator memory. Put them in registry metadata and references.

---

## 11. Final Verification

Before considering onboarding done, verify:

- capability appears in `content list`
- capability appears correctly in `content health`
- install path works
- update path is at least structurally valid
- workflow placement makes sense
- orchestrator boundary is still intact

If any of these fail, onboarding is incomplete.

---

## 12. Done Definition

A new capability is successfully onboarded when:

- it has a clean registry entry
- it installs through the toolkit
- its health state is understandable
- its execution boundary remains inside its own repo
- its workflow role is visible
- it does not force capability logic back into `content-toolkit`

That is the standard for both new first-party capabilities and new external pointers.
