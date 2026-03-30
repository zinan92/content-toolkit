<div align="center">

# content-toolkit

**AI 内容流水线。一个 CLI，全部能力按需加载。从 URL 到多平台发布，一条命令。**

[![Node.js](https://img.shields.io/badge/node-18+-339933.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Capabilities](https://img.shields.io/badge/capabilities-5-blue.svg)](#能力一览)

</div>

---

```
in  URL / 视频文件 / 文本文件
out 剪辑视频 + 字幕 + 金句片段 + 封面卡片 + 多平台文案

fail 能力未安装  → 自动 clone 对应 repo，首次约 10s
fail 依赖缺失    → 报告缺少的工具 (ffmpeg/whisper/claude) + 安装指引
fail 能力执行失败 → 透传上游错误信息，中间文件保留用于调试
```

## 示例输出

```bash
$ node cli.js videocut autocut ~/录制.mp4 -o /tmp/demo/ --no-review

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

$ ls /tmp/demo/
audio.mp3           cut.mp4             cut_feedback.json
transcript.json     transcript.srt      transcript.txt
readable.txt        sentences.txt       delete_segments.json
```

## 架构

```
                        content-toolkit (本 repo)
                              │
                         node cli.js
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         registry.json   install.js      capabilities/
         (能力注册表)     (按需下载)       (初始为空)
                                              │
                    首次使用时自动 git clone ──┤
                                              │
              ┌───────┬───────┬───────┬───────┤
              ▼       ▼       ▼       ▼       ▼
          download  extract rewrite videocut intelligence
          (stage 2) (stage 3)(stage 5)(stage 6)(stage 1)
              │       │       │       │
              ▼       ▼       ▼       ▼
          各自独立的 GitHub repo，独立开发和版本控制
```

## 快速开始

```bash
# 1. 克隆（零依赖，不需要 npm install）
git clone https://github.com/zinan92/content-toolkit.git
cd content-toolkit

# 2. 直接用（首次自动安装对应能力）
node cli.js videocut autocut ~/你的视频.mp4 -o output/ --no-review

# 3. 查看所有能力
node cli.js list
```

## 流水线全景

```
┌────┬────────────────┬──────────────────────────────────────────┐
│ #  │     问题       │               Capability                 │
├────┼────────────────┼──────────────────────────────────────────┤
│ 01 │ 什么内容火？   │ intelligence (趋势检测/选题建议)          │
│ 02 │ 拿到原始内容   │ download (抖音/小红书/公众号/X)           │
│ 03 │ 它说了什么？   │ extract (转录/OCR/清洗)                   │
│ 04 │ 100 选 3       │ curator (coming soon)                     │
│ 05 │ 变成我的内容   │ rewrite (跨平台改写)                      │
│ 06 │ 做成成品       │ videocut (7 个视频编辑能力)               │
│ 07 │ 发出去         │ publisher (coming soon)                   │
│ 08 │ 什么 work 了？ │ tracker (coming soon)                     │
└────┴────────────────┴──────────────────────────────────────────┘
```

## 能力一览

| 能力 | 命令 | 输入 | 输出 | 依赖 |
|------|------|------|------|------|
| intelligence | `content intelligence` | — | 趋势报告 + 选题建议 | Python 3 |
| download | `content download <url>` | URL | 视频/图片/文章 + 元数据 | Python 3 |
| extract | `content extract <dir>` | 文件目录 | 转录文本 + OCR + 清洗文章 | Python 3, Whisper |
| rewrite | `content rewrite <file>` | 文本文件 | 平台文案 (小红书/公众号/X) | Python 3, Claude CLI |
| videocut | `content videocut <sub>` | 视频文件 | 见下表 | Node, FFmpeg, Whisper, Claude CLI |

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
node cli.js videocut pipeline ~/录制.mp4 --steps autocut,speed,subtitle,hook,cover -o output/
```

### 下载别人的内容 → 改写发布

```bash
node cli.js download https://douyin.com/video/xxx -o raw/
node cli.js extract raw/
node cli.js rewrite raw/transcript.md --platform xhs
```

### 长视频拆条

```bash
node cli.js videocut clip ~/长视频.mp4 -o clips/
```

## 管理命令

```bash
node cli.js list              # 查看所有能力 + 安装状态
node cli.js list --installed  # 只看已安装的
node cli.js install <name>    # 预装某个能力
node cli.js update <name>     # 更新已安装的能力
node cli.js remove <name>     # 删除已安装的能力
```

## 项目结构

```
content-toolkit/
├── cli.js            # 统一入口
├── install.js        # 懒加载安装器 (首次使用时 clone)
├── registry.json     # 能力注册表 (repo URL + 依赖)
├── capabilities/     # 初始为空，按需填充
│   ├── download/     # → zinan92/content-downloader
│   ├── extract/      # → zinan92/content-extractor
│   ├── rewrite/      # → zinan92/content-rewriter
│   ├── videocut/     # → zinan92/videocut
│   └── intelligence/ # → zinan92/content-intelligence
├── SKILL.md          # Agent 入口 (路由 + 决策树)
└── README.md
```

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| CLI | Node.js 18+ (built-ins only) | 路由 + 懒加载安装 |
| 注册表 | registry.json | 能力发现 + 依赖检查 |
| 能力 | 独立 Git repos | 各自独立开发和部署 |
| 依赖管理 | git clone --depth 1 | 浅克隆，按需下载 |

零 npm 依赖。整个 toolkit 只用 Node.js 内置模块。

## For AI Agents

**读 `SKILL.md` 获取完整路由逻辑。** SKILL.md 包含意图匹配表和决策树，告诉 agent 用户说什么话该用什么能力。

### Capability Contract

```yaml
name: content-toolkit
version: 1.0.0
capability:
  summary: Unified CLI for AI content pipeline — lazy-install capabilities on first use
  in: URL | video file | text file
  out: edited video + subtitles + hooks + cards + platform copy
  fail:
    - "capability not installed → auto clone from GitHub"
    - "missing dependency → report + install instructions"
    - "capability execution error → passthrough upstream error"
cli_command: node cli.js
cli_args:
  - name: capability
    type: string
    required: true
    description: "能力名称 (download/extract/rewrite/videocut/intelligence)"
  - name: input
    type: string
    required: false
    description: "输入文件或 URL"
cli_flags:
  - name: -o
    type: string
    description: "输出目录"
  - name: --steps
    type: string
    description: "pipeline 模式下的步骤列表 (逗号分隔)"
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
```

## 相关项目

| 项目 | 说明 | 链接 |
|------|------|------|
| videocut | 视频编辑能力集 (7 个独立能力) | [zinan92/videocut](https://github.com/zinan92/videocut) |
| content-downloader | 统一内容下载器 | [zinan92/content-downloader](https://github.com/zinan92/content-downloader) |
| content-extractor | 多模态内容提取 | [zinan92/content-extractor](https://github.com/zinan92/content-extractor) |
| content-rewriter | 跨平台内容改写 | [zinan92/content-rewriter](https://github.com/zinan92/content-rewriter) |
| content-intelligence | 内容洞察引擎 | [zinan92/content-intelligence](https://github.com/zinan92/content-intelligence) |

## License

MIT
