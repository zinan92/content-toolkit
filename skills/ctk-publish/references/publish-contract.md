# Publish Contract

## What this skill expects

### Video publish

Minimum inputs:
- account name
- video file path
- title
- description

Typical command:

```bash
content publish <platform> upload-video --account <name> --file /abs/path/video.mp4 --title "标题" --desc "描述"
```

Reject early when missing:
- `--account`
- `--file`
- `--title`
- `--desc`
- local video file path does not exist

### Note or image publish

Minimum inputs:
- account name
- one or more image paths
- title
- note body

Typical command:

```bash
content publish <platform> upload-note --account <name> --images /abs/path/1.jpg /abs/path/2.jpg --title "标题" --note "正文"
```

Reject early when missing:
- `--account`
- `--images`
- `--title`
- `--note`
- any local image path does not exist

### Batch publish

```bash
content publish batch manifest.json --account <name> --dry-run
```

Reject early when missing:
- manifest file
- `--account`

## Before publishing

Check:
- account exists and is logged in
- media files exist
- metadata fields are present
- the user really wants distribution, not platform-native research

## When to reject early

- Missing media file
- Missing title or body
- User is still asking "is this worth posting?"
- User needs Xiaohongshu search or interaction instead of distribution
- Missing account
- Missing batch manifest
