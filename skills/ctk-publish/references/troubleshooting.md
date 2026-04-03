# Publish Troubleshooting

## Common failures

### Login or cookie invalid

Symptom:
- upload fails before media is submitted
- account check fails

Action:
- ask user to refresh login for that platform
- for Xiaohongshu-only flows, route to `/ctk-xiaohongshu`

### Media path invalid

Symptom:
- CLI reports file not found

Action:
- verify absolute path
- verify file exists before rerunning
- for batch mode, verify manifest path exists before retrying

### Metadata missing

Symptom:
- CLI rejects title, desc, note, or tags

Action:
- collect the missing fields
- do not retry with guessed values

Common CLI-first messages now include:
- `缺少 --account`
- `缺少 --file`
- `缺少 --images`
- `缺少 --title`
- `缺少 --desc`
- `缺少 --note`
