# Rewrite Presets

## Supported presets

- `xiaohongshu-note` -> `--to xiaohongshu`
- `wechat-article` -> `--to wechat`
- `x-thread` -> `--to x`

## Preset intent

- `xiaohongshu-note`
  Best for turning an existing transcript or extracted directory into a saveable, note-like Xiaohongshu draft.
  Typical outputs: note-style title ideas, condensed body copy, stronger visual-first framing.
  Natural next step: `ctk-xiaohongshu` for native posting or `ctk-publish` for distribution.

- `wechat-article`
  Best for turning source material into a longer, smoother article with clearer structure and argument flow.
  Typical outputs: longer paragraph structure, clearer section transitions, more complete narrative arc.
  Natural next step: keep refining copy or route to publish when the article is final.

- `x-thread`
  Best for compressing an idea into sharper, shorter thread-ready posts.
  Typical outputs: shorter punchier lines, clearer tweet-by-tweet progression, stronger opening hook.
  Natural next step: post to X directly through your downstream publishing flow.

## Why presets exist

Use presets when the user already knows the destination format and wants the shortest possible command.

## Example commands

```bash
content rewrite preset xiaohongshu-note ./output/video123/ --from douyin
content rewrite preset wechat-article transcript.md --from douyin
content rewrite preset x-thread notes.txt --from wechat
```

## Guardrails

- Presets still require `--from`
- Presets still require an existing input file or directory
- If the user wants multiple targets at once, use the normal `--to a,b` form instead of a preset
- If the user still does not know which platform fits best, go back to `ctk-analyze` before choosing a preset
