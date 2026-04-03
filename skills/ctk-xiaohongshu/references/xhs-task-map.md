# Xiaohongshu Task Map

## Login and session

```bash
content xiaohongshu check-login
content xiaohongshu login
```

## Search and browse

```bash
content xiaohongshu search-feeds --keyword "露营"
content xiaohongshu get-feed-detail --feed-id FEED_ID --xsec-token XSEC_TOKEN
content xiaohongshu user-profile --user-id USER_ID
```

## Interactions

```bash
content xiaohongshu like-feed --feed-id FEED_ID --xsec-token XSEC_TOKEN
content xiaohongshu favorite-feed --feed-id FEED_ID --xsec-token XSEC_TOKEN
content xiaohongshu post-comment --feed-id FEED_ID --xsec-token XSEC_TOKEN --content "评论内容"
```

## Publishing

```bash
content xiaohongshu publish --title-file title.txt --content-file body.txt --images /abs/path/1.jpg
content xiaohongshu publish-video --title-file title.txt --content-file body.txt --video /abs/path/demo.mp4
```

## CLI-first validation rules

- 缺 `--keyword` -> 不执行搜索
- 缺 `--feed-id` 或 `--xsec-token` -> 不执行详情或互动
- 缺 `--title-file` / `--content-file` / `--images` / `--video` -> 不执行发布
- 本地文件不存在 -> 直接在 CLI 层报错，不等下游失败
