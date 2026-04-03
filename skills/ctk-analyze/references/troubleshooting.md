# Analyze Troubleshooting

## Common failures

### 1. No analysis mode was provided

- Symptom: user only says "analyze this"
- Response: offer one of these paths:
  - `content analyze extract <目录>`
  - `content analyze transcribe input.mp4`
  - `content analyze trends`
  - `content analyze hooks <目录>`

### 2. Directory extraction was requested without a directory

- Response: point to `content analyze extract <目录>`
- Guardrail: reject single files here; `extract` still expects a directory

### 3. Single-video transcription was requested without a local file

- Response: point to `content analyze transcribe input.mp4`
- Guardrail: do not pretend a remote URL can be transcribed directly

### 4. User wants judgment, not extraction

- Symptom: they ask "what topic should I do" or "why did this hook work"
- Response:
  - no input yet -> `content analyze trends`
  - already has a content directory -> `content analyze hooks <目录>` or `content analyze readiness <目录>`

### 5. Unsupported analysis mode

- Response: explain the supported modes directly
- Current supported modes:
  - `extract`
  - `transcribe`
  - `trends`
  - `hooks`
  - `competitors`
  - `readiness`

## Recovery rule

`ctk-analyze` is a decision layer. If the user actually needs content creation or upload, move them to rewrite, videocut, publish, or xiaohongshu after the analysis is done.
