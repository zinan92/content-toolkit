<div align="center">

# content-toolkit

**AI 社交媒体工作流工具箱。一个 CLI，加上一套 router skill 和子 skills，把下载、分析、改写、剪辑、发布、小红书原生操作串成一条链。**

[![Node.js](https://img.shields.io/badge/node-18+-339933.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Capabilities](https://img.shields.io/badge/capabilities-7-blue.svg)](#功能一览)

</div>

---

```text
in  URL | 视频文件 | 文本文件 | 内容目录 | 平台任务
out 下载素材 + 转录文本 + 平台文案 + 剪辑视频 + 字幕 + 金句片段 + 封面卡片 + 多平台发布 + 小红书原生动作

fail 能力未安装     → 自动 git clone 对应 repo + 创建 venv + 安装依赖，首次约 10-30s
fail 系统依赖缺失   → 报告缺少的工具 (ffmpeg/whisper/claude) + 安装指引
fail 能力执行失败   → 透传上游错误信息，中间文件保留用于调试
fail 直接传 URL     → 智能提示 "看起来你想下载内容？试试 content download <URL>"
fail 直接传 .mp4    → 智能提示对应的 videocut 子命令
```

## 现在它是什么

`content-toolkit` 现在不只是一个 CLI。

它由两层组成：

1. 一个统一入口 `content`
2. 一套 dbskill 风格的 skill 系统

这套 skill 系统分成两类：

- 工作流 skill：`ctk-download` `ctk-analyze` `ctk-rewrite` `ctk-videocut` `ctk-publish`
- 平台 skill：`ctk-xiaohongshu`

根 skill `SKILL.md` 是总控，不负责把所有细节写死。细节会下沉到各个 skill 自己的 `references/` 和 `scripts/` 里。

## 示例输出

```
$ content

content-toolkit — AI 内容生产工具箱

我想要...                                          命令
─────────────────────────────────────────────────────────────────
下载视频/文章/图文    content download <URL>
  抖音视频             content download https://douyin.com/video/xxx
  抖音博主全部视频     content download https://douyin.com/user/xxx
  小红书笔记           content download https://xiaohongshu.com/explore/xxx
  微信公众号文章       content download https://mp.weixin.qq.com/s/xxx
  X/Twitter 推文       content download https://x.com/user/status/xxx

提取文字/转录         content extract <内容目录>
  从下载目录提取        content extract ./output/douyin/user/video123/

分析趋势/内容判断      content analyze <模式>
  从目录提取文字        content analyze extract ./output/douyin/user/video123/
  单视频转录            content analyze transcribe input.mp4
  看趋势/选题           content analyze trends
  看 hooks/结构         content analyze hooks ./output/douyin/user/video123/
  看竞品/发布准备度      content analyze competitors ./output/douyin/user/video123/

改写成其他平台        content rewrite <内容目录> --from <来源> --to <目标>
  抖音→小红书           content rewrite ./output/video123/ --from douyin --to xiaohongshu
  小红书笔记预设         content rewrite preset xiaohongshu-note ./output/video123/ --from douyin

编辑视频              content videocut <子命令> <视频文件>
  转录视频为文字        content videocut transcribe input.mp4
  去口癖/废话           content videocut autocut input.mp4 -o output/
  加字幕                content videocut subtitle input.mp4 --lang zh
  截精彩片段            content videocut hook input.mp4 -o output/
  拆成多个短视频        content videocut clip input.mp4 -o output/
  生成封面/金句卡        content videocut cover input.mp4 --text "你的金句"
  短视频预设            content videocut preset short-form input.mp4 -o output/
  一条龙处理            content videocut pipeline input.mp4 --steps autocut,subtitle -o output/

小红书原生操作         content xiaohongshu <子命令>
  检查登录状态          content xiaohongshu check-login
  搜索笔记              content xiaohongshu search-feeds --keyword "露营"
  发布图文              content xiaohongshu publish --title-file title.txt --content-file body.txt --images /abs/path/1.jpg

多平台发布             content publish <平台子命令>
  发小红书视频          content publish xiaohongshu upload-video --account creator --file demo.mp4 --title "标题" --desc "描述"
  发小红书图文          content publish xiaohongshu upload-note --account creator --images 1.jpg 2.jpg --title "标题" --note "正文"
  批量定时发布          content publish batch manifest.json --account creator --dry-run

管理:
  content list              查看所有能力及安装状态
  content install <name>    预装一个能力
  content update <name>     更新已安装的能力
  content remove <name>     删除已安装的能力
```

```bash
$ content videocut autocut ~/录制.mp4 -o /tmp/demo/ --no-review

  Installing videocut from zinan92/videocut...
  Installed: videocut

═══ AutoCut: Transcribing ═══
  Extracting audio...
  Transcribing (model: small)...
  Done: 42 subtitle entries
═══ AutoCut: Silence detection ═══
  12 silence segments (≥0.5s)
═══ AutoCut: AI analysis ═══
  AI marked 8 additional segments
═══ AutoCut: Cutting ═══
  ✅ AutoCut complete: /tmp/demo/cut.mp4
```

## 架构

```
                      content + root SKILL.md
               (统一 CLI 入口 + 社媒总控 router)
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         registry.json   install.js         skills/
         (能力注册表)     (按需安装器)   (router + 子 skills)
              │                                 │
              │                     ┌───────────┴───────────┐
              │                     │                       │
              │                工作流 skills            平台 skills
              │                ctk-download            ctk-xiaohongshu
              │                ctk-analyze
              │                ctk-rewrite
              │                ctk-videocut
              │                ctk-publish
                              │
                    首次使用时自动执行:
                    1. git clone --depth 1
                    2. 检测 pyproject.toml / requirements.txt
                    3. 创建 .venv + pip install -e .
                    4. 解析 entry → venv/bin CLI 命令
                              │
          ┌───────┬───────┬────────┬──────────┬──────────────┬─────────────┐
          ▼       ▼       ▼        ▼          ▼              ▼
      download  extract analyze rewrite videocut     publish       xiaohongshu
      Python    Python  Python  Node.js   Python         Python/CLI      Python/Browser
          │       │       │        │          │              │              │
          ▼       ▼       ▼        ▼          ▼              ▼              ▼
      各自独立的 GitHub repo，独立开发和版本控制
```

## 快速开始

```bash
# 1. 克隆（零依赖，不需要 npm install）
git clone https://github.com/zinan92/content-toolkit.git
cd content-toolkit

# 2. 直接用（首次自动安装对应能力 + Python 依赖）
node cli.js download https://douyin.com/video/xxx
node cli.js analyze extract ./output/douyin/user/video123/
node cli.js videocut autocut ~/你的视频.mp4 -o output/ --no-review

# 3. 查看所有能力
node cli.js list
```

## 功能一览

| # | 能力 | 命令 | 说明 | 状态 |
|---|------|------|------|------|
| 1 | analyze | `content analyze <模式>` | 统一分析入口，负责目录提取、单视频转录、趋势检测、爆款归因、选题建议 | 已完成 |
| 2 | download | `content download <URL>` | 统一下载 (抖音/小红书/公众号/X) | 已完成 |
| 3 | extract | `content extract <目录>` | 多模态提取 (转录/OCR/清洗)，面向下载后的内容目录 | 已完成 |
| 4 | rewrite | `content rewrite <目录\|文本文件>` | 跨平台改写，支持裸 .md/.txt + 默认参数 | 已完成 |
| 5 | videocut | `content videocut <子命令>` | 视频编辑 (7 个子能力)，支持批量目录输入 | 已完成 |
| 6 | publish | `content publish <平台子命令>` | 多平台发布、定时发布、批量发布 | 已接入 |
| 7 | xiaohongshu | `content xiaohongshu <子命令>` | 小红书站内登录、搜索、互动、原生发布 | 已接入 |

## Skill System

| Skill | 本质 | 作用 |
|---|---|---|
| `content-toolkit` | 总控 router | 识别卡点，分发到正确子 skill |
| `ctk-download` | 内容获取流程 | 从 URL 或平台抓原始素材 |
| `ctk-analyze` | 内容分析流程 | 转录、OCR、趋势、竞品、发布前判断 |
| `ctk-rewrite` | 平台改写流程 | 把内容改成目标平台表达 |
| `ctk-videocut` | 视频处理流程 | 字幕、粗剪、hook、拆条、封面 |
| `ctk-publish` | 分发流程 | 多平台、一稿多发、定时、批量 |
| `ctk-xiaohongshu` | 平台原生流程 | 小红书登录、搜索、互动、发布 |

每个 skill 都尽量遵循同一个结构：
- `SKILL.md`：角色、哲学、Phase 工作流、路由规则
- `references/`：命令契约、矩阵、检查清单、故障排查
- `scripts/`：稳定命令模板和参数预处理

常用别名也会在 CLI 执行前被规范化：
- `content intelligence` -> `content analyze`
- `xhs` -> `xiaohongshu`
- `wx` / `weixin` -> `wechat`
- `twitter` -> `x`

### Videocut 子能力

| 子命令 | 做什么 | 输出 |
|--------|--------|------|
| `transcribe` | 语音转文字 | transcript.json + .txt + .srt |
| `autocut` | 去语气词/停顿/口误 | cut.mp4 |
| `subtitle` | 检测/生成/烧录字幕 | subtitled.mp4 + .srt |
| `hook` | 提取金句 + 切视频片段 | hooks.json + hook.mp4 |
| `clip` | 长视频拆短视频 | chapters.json + clips/*.mp4 |
| `cover` | 封面 + 金句卡片 | card_*.png (1080x1080) |
| `speed` | 变速 (1.1x-1.2x) | speed.mp4 |
| `pipeline` | 串联多个子能力 | 取决于 --steps |

## 常用工作流

### 口播视频一条龙

```bash
content videocut pipeline ~/录制.mp4 --steps autocut,speed,subtitle,hook,cover -o output/
```

### 下载别人的内容 → 改写发布

```bash
content download https://douyin.com/video/xxx -o raw/
content analyze extract raw/
content rewrite preset xiaohongshu-note raw/ --from douyin
```

适合“素材已经拿到，目标平台也明确”的情况。
- `xiaohongshu-note` 更像笔记成品稿
- `wechat-article` 更适合长文整理
- `x-thread` 更适合短句线程化表达

### 小红书站内观察 → 原生发布

```bash
content xiaohongshu check-login
content xiaohongshu search-feeds --keyword "露营"
content xiaohongshu publish --title-file title.txt --content-file body.txt --images /abs/path/1.jpg
```

### 一稿多平台发布

```bash
content publish xiaohongshu upload-video --account creator --file demo.mp4 --title "标题" --desc "描述"
content publish douyin upload-video --account creator --file demo.mp4 --title "标题" --desc "描述"
```

### 长视频拆条

```bash
content videocut clip ~/长视频.mp4 -o clips/
```

### 常见短视频成品流

```bash
content videocut preset short-form ~/录制.mp4 -o output/
```

适合快速做一条可发布短视频。默认会串起：
- `autocut`
- `speed`
- `subtitle`
- `hook`
- `cover`

如果你想做多条拆条成品，更适合：

```bash
content videocut preset repurpose-clips ~/长视频.mp4 -o output/
```

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| CLI | Node.js 18+ (built-ins only) | 路由 + 懒加载安装 + venv 解析 |
| 注册表 | registry.json | 能力发现 + entry point 定义 + 依赖检查 |
| 安装器 | install.js | git clone + pyproject.toml/requirements.txt 检测 + venv 创建 |
| 能力 | 独立 Git repos | 各自独立开发和部署 |
| Python 能力 | venv + pip install -e . | 隔离依赖，CLI 命令装在 venv/bin |

零 npm 依赖。整个 toolkit 只用 Node.js 内置模块。

## 项目结构

```
content-toolkit/
├── cli.js            # 统一入口 (路由 + venv/bin 解析 + 中文帮助)
├── install.js        # 懒加载安装器 (clone + venv + pip install)
├── registry.json     # 能力注册表 (repo URL + entry point + 依赖)
├── skills/           # dbskill 风格 skill 系统
│   ├── ctk-download/
│   ├── ctk-analyze/
│   ├── ctk-rewrite/
│   ├── ctk-videocut/
│   ├── ctk-publish/
│   └── ctk-xiaohongshu/
├── capabilities/     # 初始为空，按需填充
│   ├── download/     # → zinan92/content-downloader
│   ├── extract/      # → zinan92/content-extractor
│   ├── rewrite/      # → zinan92/content-rewriter
│   ├── videocut/     # → zinan92/videocut
│   ├── analyze/      # → zinan92/content-intelligence
│   ├── publish/      # → dreammis/social-auto-upload
│   └── xiaohongshu/  # → autoclaw-cc/xiaohongshu-skills
├── SKILL.md          # 根 skill：社媒总控 router
├── docs/plans/       # 设计与实现计划
└── README.md
```

## For AI Agents

读根 [SKILL.md](./SKILL.md) 获取完整路由逻辑。

建议顺序：

1. 先读根 `SKILL.md`
2. 根据用户任务进入对应子 skill
3. 只在需要时读取该子 skill 的 `references/`
4. 命令容易出错时，优先复用该 skill 自带的 `scripts/`

### Capability Contract

```yaml
name: content-toolkit
version: 1.0.0
capability:
  summary: Unified CLI plus router skill system for social media operations
  in: URL | video file | text file | content directory | platform-native task
  out: downloaded media + transcripts + platform copy + edited video + subtitles + hooks + cards + published posts + Xiaohongshu-native actions
  fail:
    - "capability not installed → auto clone + venv + pip install"
    - "missing system dependency → report + install instructions"
    - "capability execution error → passthrough upstream error"
    - "bare URL input → suggest content download <URL>"
    - "bare .mp4 input → suggest videocut subcommand"
cli_command: node cli.js
cli_args:
  - name: capability
    type: string
    required: true
    description: "能力名称 (download/extract/analyze/rewrite/videocut/publish/xiaohongshu)"
  - name: subcommand
    type: string
    required: false
    description: "子命令 (videocut 专用: transcribe/autocut/subtitle/hook/clip/cover/speed/pipeline)"
  - name: input
    type: string
    required: false
    description: "输入文件、目录或 URL"
cli_flags:
  - name: -o
    type: string
    description: "输出目录"
  - name: --from
    type: string
    description: "来源平台 (rewrite 用)"
  - name: --to
    type: string
    description: "目标平台 (rewrite 用，逗号分隔多个)"
  - name: --steps
    type: string
    description: "pipeline 模式下的步骤列表 (逗号分隔)"
  - name: --no-review
    type: boolean
    description: "跳过人工确认 (autocut 用)"
```

### Agent 调用示例

```python
import subprocess

# 口播视频 → 剪辑 + 加字幕
result = subprocess.run(
    ["node", "cli.js", "videocut", "pipeline", "input.mp4",
     "--steps", "autocut,subtitle", "-o", "output/", "--no-review"],
    capture_output=True, text=True, cwd="/path/to/content-toolkit"
)
print(result.stdout)

# 下载 + 提取 + 改写
for cmd in [
    ["node", "cli.js", "download", "https://douyin.com/video/xxx", "-o", "raw/"],
    ["node", "cli.js", "analyze", "extract", "raw/"],
    ["node", "cli.js", "rewrite", "raw/", "--from", "douyin", "--to", "xiaohongshu"],
]:
    subprocess.run(cmd, cwd="/path/to/content-toolkit", check=True)
```

```python
# 小红书搜索
subprocess.run(
    ["node", "cli.js", "xiaohongshu", "search-feeds", "--keyword", "露营"],
    cwd="/path/to/content-toolkit",
    check=True,
)

# 多平台发布
subprocess.run(
    ["node", "cli.js", "publish", "xiaohongshu", "upload-video",
     "--account", "creator", "--file", "/abs/path/demo.mp4",
     "--title", "标题", "--desc", "描述"],
    cwd="/path/to/content-toolkit",
    check=True,
)
```

## 相关项目

| 项目 | 说明 | 链接 |
|------|------|------|
| content-intelligence | 内容洞察引擎 (趋势检测/选题建议) | [zinan92/content-intelligence](https://github.com/zinan92/content-intelligence) |
| content-downloader | 统一内容下载器 | [zinan92/content-downloader](https://github.com/zinan92/content-downloader) |
| content-extractor | 多模态内容提取 | [zinan92/content-extractor](https://github.com/zinan92/content-extractor) |
| content-rewriter | 跨平台内容改写 | [zinan92/content-rewriter](https://github.com/zinan92/content-rewriter) |
| videocut | 视频编辑能力集 (7 个独立能力) | [zinan92/videocut](https://github.com/zinan92/videocut) |
| social-auto-upload | 多平台发布引擎 | [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload) |
| xiaohongshu-skills | 小红书平台原生能力 | [autoclaw-cc/xiaohongshu-skills](https://github.com/autoclaw-cc/xiaohongshu-skills) |

## License

MIT
