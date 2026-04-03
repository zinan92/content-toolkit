# Analysis Modes

## 1. Extract from downloaded directory

Use when the user already has a content directory:

```bash
content analyze extract <目录>
```

Best for:
- downloaded videos
- article directories
- mixed media folders

Guardrails:
- 如果用户没给目录，提示 `content analyze extract <目录>`
- 如果给的是单个文件而不是目录，直接说明 `extract` 只接受目录
- 如果用户只有一个裸视频文件，转去 `content analyze transcribe`

## 2. Transcribe a raw video file

Use when the user only has a single local video:

```bash
content analyze transcribe input.mp4
```

## 3. Run trend or topic analysis

Use when the user asks:
- what is trending
- what topic to do next
- why this style works
- what competitors are doing

```bash
content analyze trends
```

## 4. Inspect hooks, competitors, or publish readiness from a content directory

Use when the user already has a downloaded or extracted directory and wants judgment instead of raw extraction:

```bash
content analyze hooks <目录>
content analyze competitors <目录>
content analyze readiness <目录>
```

## Decision shortcut

- Need text from files -> `analyze extract` or `analyze transcribe`
- Need judgment or topic choice -> `analyze trends`
- Need judgment from an existing directory -> `analyze hooks|competitors|readiness <目录>`

## Preflight checks

- `extract` 需要目录，不接受单个文件
- `analyze transcribe` 需要本地视频文件
- 趋势分析没有输入内容时，可以直接走 `content analyze trends`
- `hooks` `competitors` `readiness` 都需要内容目录
