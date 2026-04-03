# Rewrite Troubleshooting

## Common failures

### 1. Missing `--from`

- Response: explain that rewrite needs a source platform before it can decide tone and structure

### 2. Missing `--to`

- Response: explain that rewrite needs a target platform before it can decide output style

### 3. Unsupported source or target platform

- Response: show the supported platform list directly
- Guardrail: normalize common aliases like `xhs`, `wx`, and `twitter` before rejecting the request

### 4. Input file or directory does not exist

- Response: report the missing path directly
- Guardrail: do not guess which file the user meant

### 5. User really needs analysis first

- Symptom: source material is incomplete or still unclear
- Response: send them back to `ctk-analyze`

### 6. User really needs upload, not rewrite

- Symptom: they already have publish-ready copy and are asking to post it
- Response: route to `ctk-publish` or `ctk-xiaohongshu`
