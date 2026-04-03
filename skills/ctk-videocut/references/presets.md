# Videocut Presets

## Supported presets

- `short-form` -> `autocut,speed,subtitle,hook,cover`
- `subtitle-hook` -> `subtitle,hook`
- `repurpose-clips` -> `autocut,subtitle,clip,cover`

## Preset intent

- `short-form`
  Best for a single talking-head or short-form publish-ready cut.
  Typical outputs: cleaned video, subtitles, hook clip, cover card.
  Natural next step: `ctk-publish` or `ctk-xiaohongshu`.

- `subtitle-hook`
  Best when the raw video is already acceptable but needs stronger opening and subtitle support.
  Typical outputs: subtitled video plus hook-oriented cut.
  Natural next step: review the hook, then publish.

- `repurpose-clips`
  Best for turning one longer source video into reusable short clips with cards.
  Typical outputs: multiple clips plus cover assets.
  Natural next step: `ctk-rewrite` for clip copy or `ctk-publish` for batch posting.

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
- If the user wants to understand whether the content itself is strong enough, go back to `ctk-analyze` before editing more
