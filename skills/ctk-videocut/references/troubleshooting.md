# Videocut Troubleshooting

## Common failures

### 1. No subcommand was provided

- Response: ask the user to choose a concrete action such as `transcribe`, `autocut`, `subtitle`, or `pipeline`

### 2. Video file is missing

- Response: report the exact missing path
- Guardrail: do not silently switch to another file

### 3. Pipeline is missing `--steps`

- Response: point to:

```bash
content videocut pipeline input.mp4 --steps autocut,subtitle -o output/
```

### 4. User is asking for a content judgment, not a video operation

- Response: send them to `ctk-analyze`

### 5. User is done editing and really wants to post

- Response: move them to `ctk-publish` or `ctk-xiaohongshu`

## Recovery rule

Prefer one clean next step. Do not stack multiple video operations unless the user clearly wants a pipeline.
