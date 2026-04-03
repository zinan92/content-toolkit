# Platform Rewrite Map

## Common conversions

- Douyin -> Xiaohongshu
- Douyin -> WeChat
- Douyin -> X
- Transcript -> Xiaohongshu
- Transcript -> WeChat

## Supported platforms

- `douyin`
- `xiaohongshu`
- `wechat`
- `x`
- `bilibili`
- `kuaishou`
- `tiktok`

## Alias normalization

- `xhs` -> `xiaohongshu`
- `wx` / `weixin` -> `wechat`
- `twitter` -> `x`

## Standard command

```bash
content rewrite <目录或文本> --from <source> --to <target>
```

如果用户没有把平台说完整，不要开始改写。

至少要确认：
- 输入文件或目录存在
- `--from` 已给
- `--to` 已给

## Platform thinking

- Xiaohongshu: note-like, saveable, visual, strong cover-title fit
- WeChat: longer structure, smoother paragraphs, clearer argument chain
- X: sharper, shorter, more thread-friendly

## Guardrails

- If source material is incomplete, send user back to analysis
- If the user wants actual upload, route to publish or Xiaohongshu
- 如果输入路径不存在，直接报文件不存在，不要猜
- 如果缺 `--from` 或 `--to`，先补平台信息，不要硬改
- 如果平台别名是 `xhs`、`wx`、`twitter`，先在本地规范成标准平台名再执行
