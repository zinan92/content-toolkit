# Content Toolkit Weekly Operations Checklist

**Date:** 2026-04-07
**Audience:** Maintainer / Operator of `zinan92/content-toolkit`
**Purpose:** Keep the orchestrator healthy, current, and usable in day-to-day work without drifting back into architecture work.

---

## Weekly Goal

At the end of each week, you should know:

- which capabilities are installed and healthy
- whether any critical workflow is degraded
- whether external capability sources are still trustworthy
- whether `content-toolkit` is still acting as an orchestrator rather than a capability host

---

## 1. Registry Health Check

**Run**

```bash
cd /Users/wendy/content-toolkit
node cli.js list
node cli.js health
```

**Check**

- `registry.v2.json` is still the only active registry file
- all expected canonical capabilities appear in `content list`
- health output clearly marks `installed`, `not_installed`, `degraded`, or `unavailable`
- known issues are still attached to the correct capability

**If something is wrong**

- fix registry metadata first
- do not patch around the problem inside workflow logic

---

## 2. Installed State Check

**Inspect**

- `capabilities/.meta/*.json`

**Check**

- each installed capability has a metadata file
- metadata includes source, ref, installed timestamp, and health
- external capabilities show whether they came from primary, fallback, or cache

**If something is wrong**

- re-run install or update through the toolkit
- do not manually edit installed capability directories unless debugging

---

## 3. Critical Capability Check

Review the current critical path capabilities:

- `download`
- `extract`
- `rewrite`
- `videocut`
- `publish` if currently used in production workflow

**Check**

- each critical capability has a valid registry entry
- each critical capability still has a working entrypoint
- external critical capabilities still have an explicit trust level
- `publish` fallback status is still visible and understandable

---

## 4. Workflow Smoke Test

Run at least one lightweight workflow-level verification every week.

**Minimum**

```bash
cd /Users/wendy/content-toolkit
node cli.js workflow douyin-to-xhs --help
```

**Preferred**

Run one real but low-risk chain:

- `download -> extract`
- or `extract -> rewrite`
- or `videocut` on a local sample file

**Check**

- workflow definitions still resolve from `registry.v2.json`
- toolkit still installs missing capabilities correctly
- capability chaining still uses registry metadata instead of hardcoded paths

---

## 5. External Source Check

Review every external capability in `registry.v2.json`.

Current external set:

- `publish`
- `xiaohongshu-skills`

**Check**

- upstream repo still exists
- pinned ref is still intentional
- trust level still matches reality
- fallback configuration is still appropriate
- reference-only capabilities are not exposed as runnable business tools

**Escalate when**

- an external capability becomes part of a primary workflow
- upstream becomes unstable
- authentication or install requirements change

---

## 6. Orchestrator Boundary Check

Review these files:

- `/Users/wendy/content-toolkit/SKILL.md`
- `/Users/wendy/content-toolkit/cli.js`
- `/Users/wendy/content-toolkit/install.js`
- `/Users/wendy/content-toolkit/workflows.js`

**Check**

- `SKILL.md` still frames the toolkit as an orchestrator
- `cli.js` still routes through registry metadata
- `install.js` still handles distribution, health, and metadata only
- no first-party business logic has been copied back into the toolkit

**Red flags**

- hardcoded capability behavior appears in toolkit files
- capability-specific platform rules start living in `content-toolkit`
- workflow logic bypasses registry metadata

---

## 7. Dependency and Credential Check

Before treating a workflow failure as a system failure, verify:

- cookies/session files still exist
- platform login state is valid
- Python and Node dependencies still install
- external CLIs or API credentials still work

**Rule**

Environment breakage is not an architecture regression.

Record the difference explicitly.

---

## 8. Weekly Log

At the end of the weekly pass, record:

- date checked
- capabilities degraded or unavailable
- workflows tested
- external repos that need attention
- whether any capability should be promoted to critical path
- whether any external capability now deserves a fallback mirror

Keep this as a short changelog entry or issue comment. The goal is trend visibility, not prose.

---

## 9. When to Stop Re-Architecting

Do not reopen restructuring work unless at least one is true:

- registry model can no longer represent a real capability
- orchestrator boundary has started collapsing
- onboarding a new capability requires one-off hacks
- fallback model is failing for critical external repos

Otherwise, stay in operations mode:

- run the system
- note friction
- add capabilities carefully
- fix concrete reliability issues

---

## Weekly Done Definition

The weekly check is done when all of the following are true:

- `content list` is understandable
- `content health` is understandable
- at least one workflow-level verification ran
- all critical capabilities are accounted for
- all external capabilities have an explicit trust/fallback posture
- no new business logic has leaked into the orchestrator
