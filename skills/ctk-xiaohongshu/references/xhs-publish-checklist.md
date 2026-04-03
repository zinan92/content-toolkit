# Xiaohongshu Publish Checklist

## Before publishing an image note

- title exists
- body exists
- image paths exist
- user really wants Xiaohongshu-native publish
- `--title-file` exists
- `--content-file` exists
- `--images` contains at least one existing local file

## Before publishing a video

- title exists
- body exists
- video path exists
- format is suitable for upload
- `--title-file` exists
- `--content-file` exists
- `--video` exists

## Search and interaction checks

- `search-feeds` 必须给 `--keyword`
- `get-feed-detail` / `like-feed` / `favorite-feed` 必须给 `--feed-id` 和 `--xsec-token`
- `post-comment` 还必须给 `--content`

## Routing rule

- Need site-native behavior -> stay here
- Need one-to-many distribution -> go to `ctk-publish`
