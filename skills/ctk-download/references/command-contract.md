# Download Command Contract

## Default command

```bash
content download <URL> -o raw/
```

如果用户没有给 URL，先不要往下走，直接提示：

```bash
content download <URL>
```

## Common cases

- Douyin single video: `content download <URL> -o raw/`
- Xiaohongshu note: `content download <URL> -o raw/`
- WeChat article: `content download <URL> -o raw/`
- X/Twitter post: `content download <URL> -o raw/`

## When cookies are needed

If the platform blocks anonymous access, ask the user for the cookie path and use:

```bash
content download <URL> --cookies /abs/path/cookies.json -o raw/
```

如果用户只是来拿 cookies，可以直接走：

```bash
content download fetch-cookies
```

## Early rejection rules

- 没给任何输入 -> 提示 `content download <URL>`
- 输入不是 URL，也不是 `fetch-cookies` -> 直接说明“下载需要一个 URL”
- 不要把本地文件路径误当成下载目标

## Good outputs

A successful download should leave a directory that downstream skills can point at directly.

Minimum useful outputs:
- media files
- metadata or source info
- stable directory path
