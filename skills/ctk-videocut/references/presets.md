# Videocut Presets

## Supported presets

- `short-form` -> `autocut,speed,subtitle,hook,cover`
- `subtitle-hook` -> `subtitle,hook`
- `repurpose-clips` -> `autocut,subtitle,clip,cover`

## Why presets exist

Use presets when the user wants a common editing outcome and does not want to hand-write a `--steps` list.

## Example commands

```bash
content videocut preset short-form input.mp4 -o output/
content videocut preset subtitle-hook input.mp4 -o output/
content videocut preset repurpose-clips input.mp4 -o output/
```

## Guardrails

- Presets still require a local video file
- If the user needs a custom order or custom step set, use `content videocut pipeline ... --steps ...`
