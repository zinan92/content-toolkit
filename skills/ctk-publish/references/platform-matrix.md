# Platform Matrix

## Primary publish surface

`content publish` delegates to `social-auto-upload`.

## Current first-class use cases

| Platform | Good for | Typical command family |
|---|---|---|
| Xiaohongshu | image notes, short videos | `content publish xiaohongshu ...` |
| Douyin | short videos, image notes | `content publish douyin ...` |
| Bilibili | longer videos | `content publish bilibili ...` |
| Kuaishou | short videos, image notes | `content publish kuaishou ...` |

## Rule of thumb

- Multi-platform distribution -> stay in `ctk-publish`
- Single-platform deep operating flow -> route to a platform skill
