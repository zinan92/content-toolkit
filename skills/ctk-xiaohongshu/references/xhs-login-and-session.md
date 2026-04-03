# Xiaohongshu Login and Session

## First check

Always start with:

```bash
content xiaohongshu check-login
```

## Refresh login

If the session is invalid:

```bash
content xiaohongshu login
```

## Rule

- No login status -> do not promise search, interaction, or publish
- If the user only needs multi-platform upload, prefer `ctk-publish`
