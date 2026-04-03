# Content Toolkit Skill System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single help-style root skill with a dbskill-style skill system for content-toolkit.

**Architecture:** Keep the existing CLI and lazy-install registry, but add a root router skill plus capability and platform sub-skills. Put fragile command details into `references/` and repetitive command templates into `scripts/`.

**Tech Stack:** Markdown skills, JSON registry, Node.js CLI, shell/Python helper scripts

---

### Task 1: Create the skill system scaffold

**Files:**
- Create: `skills/ctk-download/SKILL.md`
- Create: `skills/ctk-analyze/SKILL.md`
- Create: `skills/ctk-rewrite/SKILL.md`
- Create: `skills/ctk-videocut/SKILL.md`
- Create: `skills/ctk-publish/SKILL.md`
- Create: `skills/ctk-xiaohongshu/SKILL.md`

**Step 1:** Create the `skills/` directory tree and the per-skill `references/` and `scripts/` folders.

**Step 2:** Write each `SKILL.md` using the same structure:
- frontmatter
- role definition
- hard boundary
- core philosophy
- phase workflow
- output or next-step rules

**Step 3:** Keep detailed command contracts out of the main skill body unless the command is essential to reasoning.

### Task 2: Rewrite the root router skill

**Files:**
- Modify: `SKILL.md`

**Step 1:** Replace the current command-help style content with a dbskill-style root router.

**Step 2:** Keep the root focused on task recognition, route selection, and next-step recommendation.

**Step 3:** Reference child skill resources instead of duplicating their command tables.

### Task 3: Extend the capability registry

**Files:**
- Modify: `registry.json`

**Step 1:** Keep the existing capabilities.

**Step 2:** Add a `xiaohongshu` capability entry so the toolkit can treat platform-native XHS operations as a first-class capability.

**Step 3:** Preserve stage ordering for help text and install flow.

### Task 4: Add reference material and helper scripts

**Files:**
- Create: `skills/ctk-*/references/*.md`
- Create: `skills/ctk-publish/scripts/*`
- Create: `skills/ctk-xiaohongshu/scripts/*`

**Step 1:** Add short, targeted reference docs for command contracts, workflow choices, and failure modes.

**Step 2:** Add helper script templates where stable command generation matters.

**Step 3:** Keep scripts minimal and human-readable so they can be patched later.

### Task 5: Verify the new structure

**Files:**
- Inspect: `SKILL.md`
- Inspect: `skills/**`
- Inspect: `registry.json`

**Step 1:** Run `find` to verify the new skill tree exists.

**Step 2:** Run `git diff --stat` to confirm the expected change surface.

**Step 3:** Summarize the new root skill, child skills, and resource directories.
