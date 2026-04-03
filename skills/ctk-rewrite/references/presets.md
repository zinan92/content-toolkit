# Rewrite Presets

## Supported presets

- `xiaohongshu-note` -> `--to xiaohongshu`
- `wechat-article` -> `--to wechat`
- `x-thread` -> `--to x`

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
