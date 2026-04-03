# Download Troubleshooting

## Common failures

### 1. No URL was provided

- Symptom: the user says "download this" but does not paste a link
- Response: ask for the exact URL and point them to `content download <URL>`

### 2. Input is not a URL

- Symptom: the user pastes a local file path or plain text
- Response: explain that `download` only accepts a URL or `fetch-cookies`
- Next step:
  - local video -> `content analyze transcribe input.mp4` or `content videocut ...`
  - text file -> `content rewrite ...`

### 3. Platform requires cookies

- Symptom: upstream downloader rejects anonymous access
- Response: ask for a cookies file and use:

```bash
content download <URL> --cookies /abs/path/cookies.json -o raw/
```

### 4. Download succeeded but output is not usable

- Check whether the output directory contains:
  - media files
  - metadata
  - a stable folder path for downstream skills
- If not, do not send the user forward yet

## Recovery rule

Do not route to rewrite or publish until the downloaded result is stable enough to be reused.
