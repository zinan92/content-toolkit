# Xiaohongshu Troubleshooting

## Login failed

Action:
- rerun login
- confirm the browser bridge or local environment is available

## Search returns nothing

Action:
- verify keyword quality
- retry with broader terms
- confirm login status if results look suspicious
- if the CLI says `缺少 --keyword`, collect the keyword before retrying

## Publish failed

Action:
- verify title/body/media paths
- verify account session
- if the user only needs distribution, consider routing to `ctk-publish`

Common CLI-first messages now include:
- `缺少 --title-file`
- `缺少 --content-file`
- `缺少 --images`
- `缺少 --video`
- `标题文件不存在`
- `正文文件不存在`
- `图片文件不存在`
- `视频文件不存在`
