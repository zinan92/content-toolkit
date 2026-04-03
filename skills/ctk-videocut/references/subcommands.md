# Videocut Subcommands

## Single actions

- Transcribe:

```bash
content videocut transcribe input.mp4 -o output/
```

- Remove filler words:

```bash
content videocut autocut input.mp4 -o output/ --no-review
```

- Add subtitles:

```bash
content videocut subtitle input.mp4 -o output/
```

- Extract hooks:

```bash
content videocut hook input.mp4 -o output/
```

- Split into clips:

```bash
content videocut clip input.mp4 -o output/
```

- Generate cards or covers:

```bash
content videocut cover input.mp4 -o output/
```

- Speed up:

```bash
content videocut speed input.mp4 -o output/ --rate 1.1
```

Guardrails for all single actions:
- 子命令后面必须跟本地视频文件
- 如果文件不存在，直接报“视频文件不存在”

## Full pipeline

```bash
content videocut pipeline input.mp4 --steps autocut,speed,subtitle,hook,cover -o output/
```

Pipeline-specific guardrails:
- 缺视频文件 -> 直接拦下
- 缺 `--steps` -> 直接提示补步骤列表
- 不要在缺步骤时直接交给下游 CLI 报错

## Order rule

Use this order unless the user clearly wants one isolated operation:

```text
autocut -> speed -> subtitle -> hook -> clip -> cover
```
