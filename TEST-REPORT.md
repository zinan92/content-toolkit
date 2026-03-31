# content-toolkit 测试报告 (2026-03-31)

测试方法：以新用户视角，用自然语言描述需求，映射到 CLI 命令并执行。

---

## 测试结果总览（修复 BUG-1 + BUG-2 后）

| # | 用户需求 | 映射命令 | 结果 | 分类 |
|---|---------|---------|------|------|
| 1 | 下载抖音视频 | `content download <url>` | **PASS** | ~~BUG~~ 已修 |
| 2 | 视频转文字 | `content extract <video>` | FAIL | UX — extract 只接受目录 |
| 2b | 视频转文字 | `content videocut transcribe <video>` | FAIL | BUG — 路径/音频提取问题 |
| 3 | 去口播废话 | `content videocut autocut <video>` | **PASS** | - |
| 4 | 加中文字幕 | `content videocut subtitle <video> --lang zh` | **PASS** | - |
| 5 | 长视频拆短 | `content videocut clip <video>` | FAIL | BUG — Claude 输出解析 |
| 6 | 截精彩片段 | `content videocut hook <video>` | PARTIAL | UX — 无明显金句输出 |
| 7 | 文章改小红书风格 | `content rewrite <file>` | FAIL | UX — 需要 --from/--to + 目录 |
| 8 | 视频加速 | `content videocut speed <video> --rate 1.2` | FAIL | BUG — ffmpeg stderr 被吞 |
| 9 | 生成封面图 | `content videocut cover <video>` | FAIL | UX — 必须先有金句 |
| 10 | 提取抖音文案 | `content download <url>` → text.txt | **PASS** | 下载后 text.txt 就是文案 |
| 11 | 长文缩短 | `content rewrite <file>` | FAIL | UX — rewrite 不做缩写，只做跨平台改写 |
| 12 | 一条龙处理 | `content videocut pipeline --steps autocut,subtitle` | **PASS** | - |
| 13 | 下载小红书内容 | `content download <url>` | **PASS** | ~~BUG~~ 已修 |
| 14 | 英文视频翻中文 | `content extract` + `content rewrite` | FAIL | UX — 无翻译能力 |
| 15 | 批量视频转文字 | `content videocut transcribe` (多文件) | FAIL | UX — 不支持批量 |
| 16 | 挑金句做标题 | `content videocut hook <video>` | PARTIAL | UX (同#6) |
| 17 | 下载博主全部视频 | `content download <profile-url>` | **PASS** | ~~BUG~~ 已修 |
| 18 | 截重点部分 | `content videocut clip <video>` | FAIL | BUG (同#5) |
| 19 | 提取微信文章 | `content download <url>` | **PASS** | ~~BUG~~ 已修 |
| 20 | 一条龙+封面 | `content videocut pipeline --steps autocut,subtitle,cover` | FAIL | BUG — cover 无金句 |

**修复前: 通过 3/20 | 修复后: 通过 7/20 (+4)**

---

## 已修复

### ~~BUG-1~~: install.js 不支持 pyproject.toml ✅ FIXED

**改动**: `install.js` — 同时检查 `requirements.txt` 和 `pyproject.toml`，后者用 `pip install -e .`

### ~~BUG-2~~: download/extract/rewrite 子命令路由错误 ✅ FIXED

**改动**:
- `cli.js` — 新增 venv/bin CLI 命令查找逻辑
- `registry.json` — entry 从 `python3 -m module` 改为实际 CLI 命令名
  - download: `content-downloader download`
  - extract: `content-extractor extract`
  - rewrite: `content-rewriter rewrite`

---

## 剩余问题

### BUG-3: videocut transcribe 路径/音频提取问题（UC2b）

**严重度: MEDIUM**

whisper.sh 报 `找不到音频文件`，ffmpeg 提取音频可能失败但 stderr 被吞。

**修复**: whisper.sh 去掉 `2>/dev/null`，extractAudio 失败时抛明确错误。

### BUG-4: videocut clip Claude 输出解析失败（UC5/18）

**严重度: MEDIUM**

clip 依赖 Claude 分析转录来决定切割点，3 次重试全部解析失败。

**修复**: 需要降级方案（等间距切割）或更健壮的 prompt/解析。

### BUG-5: videocut speed ffmpeg 静默失败（UC8）

**严重度: LOW**

`adjust.sh` 的 `2>/dev/null` 吞了 ffmpeg 错误。手动执行同样命令可以成功。

**修复**: 去掉 `2>/dev/null`，让错误可见。

### BUG-6: pipeline 中 cover 步骤找不到金句（UC20）

**严重度: MEDIUM**

autocut→subtitle→cover 链中，cover 要求 `--quotes` 或 `--text`，但 pipeline 不传。

**修复**: pipeline 的 cover 步骤应自动读取前面生成的 `transcript.txt` 作为金句来源。

---

### UX-1: extract 不接受单个视频文件（UC2）

**严重度: HIGH**

`content extract test.mp4` 报 "not a directory"。extract 只接受 content-downloader 输出的 ContentItem 目录。

用户想转录一个视频文件时，要用 `content videocut transcribe`，但这不直觉。

**建议**: `content extract` 检测到输入是视频文件时，自动走 transcribe 路径。

### UX-2: rewrite 需要 --from/--to 和 extractor_output.json（UC7/11）

**严重度: HIGH**

用户给了一个 markdown 文件想改写，但 rewrite 要求：
1. `--from douyin --to xiaohongshu` 必填
2. 输入必须是包含 `extractor_output.json` 的目录

普通文件改写走不通。

**建议**: rewrite 支持裸 markdown/txt 输入，`--from` 默认为 `generic`，`--to` 默认为 `xiaohongshu`。

### UX-3: cover 不能独立使用（UC9）

**严重度: MEDIUM**

用户说"做个封面"，cover 要求先有金句。

**建议**: 支持 `--frame <timestamp>` 纯截帧模式；默认自动从视频转录提取金句。

### UX-4: hook 无明显金句输出（UC6/16）

**严重度: LOW**

hook 跑完只有 transcript 文件，无独立 `hooks.json` 或视频片段。

**建议**: 输出 `hooks.json`（金句 + 时间戳）和对应 `.mp4` 片段。

### UX-5: 批量转录不支持（UC15）

**严重度: LOW**

`content videocut transcribe` 只接受单文件。

**建议**: 支持目录输入，自动遍历。

### UX-6: 无翻译能力（UC14）

**严重度: LOW — 超出当前 scope**

用户期望"英文视频翻成中文文案"，但 rewrite 只做跨平台改写，不做跨语言翻译。

**建议**: 后续作为 rewrite 的新 adapter 或独立 capability。

### UX-7: 无缩写能力（UC11）

**严重度: LOW — 超出当前 scope**

"文章太长帮我缩短" — rewrite 不做摘要/缩写。

**建议**: rewrite 增加 `--mode summarize` 选项。

---

## 修复优先级（剩余）

| 优先级 | 问题 | 影响用例 | 复杂度 |
|--------|------|---------|--------|
| 1 | BUG-3: transcribe 路径 + stderr | UC2b | 低 |
| 2 | BUG-6: pipeline cover 自动金句 | UC20 | 低 |
| 3 | BUG-5: speed stderr | UC8 | 低 |
| 4 | UX-1: extract 支持单文件 | UC2 | 中 |
| 5 | UX-2: rewrite 支持裸文件 | UC7/11 | 中 |
| 6 | BUG-4: clip 降级方案 | UC5/18 | 中 |
| 7 | UX-3: cover 纯截帧 | UC9 | 低 |
| 8 | UX-4: hook 金句文件 | UC6/16 | 低 |
