#!/usr/bin/env node
// cli.js — Unified entry: content <capability> [args]

const { execFileSync, execFile } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { loadRegistry, isInstalled, install, capabilityPath, update, remove } = require('./install');

function showHelp() {
  const registry = loadRegistry();
  const sorted = Object.entries(registry).sort((a, b) => a[1].stage - b[1].stage);

  console.log(`
content-toolkit — AI 内容生产工具箱

我想要...                                          命令
─────────────────────────────────────────────────────────────────
下载视频/文章/图文    content download <URL>
  抖音视频             content download https://douyin.com/video/xxx
  抖音博主全部视频     content download https://douyin.com/user/xxx
  小红书笔记           content download https://xiaohongshu.com/explore/xxx
  微信公众号文章       content download https://mp.weixin.qq.com/s/xxx
  X/Twitter 推文       content download https://x.com/user/status/xxx

  ⚠️  抖音需要 cookies: content download <URL> --cookies cookies.json
      首次获取 cookies: content download fetch-cookies

提取文字/转录         content extract <内容目录>
  从下载目录提取        content extract ./output/douyin/user/video123/

  ⚠️  extract 接受 content-downloader 输出的目录，不接受单个视频文件
      如果你只有一个视频文件想转文字，用:
      content videocut transcribe my-video.mp4

改写成其他平台        content rewrite <内容目录> --from <来源> --to <目标>
  抖音→小红书           content rewrite ./output/video123/ --from douyin --to xiaohongshu
  抖音→公众号           content rewrite ./output/video123/ --from douyin --to wechat
  抖音→两个平台         content rewrite ./output/video123/ --from douyin --to xiaohongshu,wechat

  ⚠️  rewrite 需要先跑过 extract（自动生成 extractor_output.json）
  ⚠️  也支持直接传 .md/.txt 文件

编辑视频              content videocut <子命令> <视频文件>
  转录视频为文字        content videocut transcribe input.mp4
  去口癖/废话           content videocut autocut input.mp4 -o output/
  加字幕                content videocut subtitle input.mp4 --lang zh
  截精彩片段            content videocut hook input.mp4 -o output/
  拆成多个短视频        content videocut clip input.mp4 -o output/
  生成封面/金句卡        content videocut cover input.mp4 --text "你的金句"
  加速(1.0-1.2x)       content videocut speed input.mp4 --rate 1.2 -o output/
  一条龙处理            content videocut pipeline input.mp4 --steps autocut,subtitle -o output/

─────────────────────────────────────────────────────────────────
典型工作流:
  1. 下载  content download https://douyin.com/video/xxx --cookies cookies.json
  2. 提取  content extract ./output/douyin/user/video123/
  3. 改写  content rewrite ./output/douyin/user/video123/ --from douyin --to xiaohongshu

管理:
  content list              查看所有能力及安装状态
  content install <name>    预装一个能力（否则首次使用时自动安装）
  content update <name>     更新已安装的能力
  content remove <name>     删除已安装的能力
`);

  console.log('已安装的能力:');
  for (const [name, cap] of sorted) {
    const installed = isInstalled(name);
    const status = installed ? '✓' : '·';
    console.log(`  ${status} ${name.padEnd(14)} ${cap.description}`);
  }
}

function showList(onlyInstalled) {
  const registry = loadRegistry();
  const sorted = Object.entries(registry).sort((a, b) => a[1].stage - b[1].stage);

  for (const [name, cap] of sorted) {
    const installed = isInstalled(name);
    if (onlyInstalled && !installed) continue;
    const status = installed ? 'installed' : 'not installed';
    console.log(`  ${name.padEnd(14)} [${status}]  ${cap.description}`);
  }
}

function runCapability(name, args) {
  const registry = loadRegistry();
  const cap = registry[name];
  if (!cap) {
    // Check if user passed a URL directly (common mistake)
    if (name.startsWith('http://') || name.startsWith('https://')) {
      console.error(`看起来你想下载内容？试试:\n  content download ${name}\n`);
    } else if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.mp3')) {
      console.error(`看起来你想处理一个视频/音频文件？试试:\n  content videocut transcribe ${name}   # 转文字\n  content videocut autocut ${name}     # 去废话\n  content videocut subtitle ${name}    # 加字幕\n`);
    } else {
      console.error(`未知命令: "${name}"\n运行 content 查看所有可用命令。`);
    }
    process.exit(1);
  }

  // Auto-install on first use
  const capDir = install(name);

  // Build the command
  const [cmd, ...baseArgs] = cap.entry.split(' ');

  // Resolve relative paths in user args to absolute before changing cwd to capDir.
  // This covers -o/--output-dir values, --cookies paths, and positional input paths.
  const userCwd = process.cwd();
  const PATH_FLAGS = new Set(['-o', '--output-dir', '--cookies', '--style-dir', '--feedback-dir', '--output']);
  const resolvedUserArgs = args.map((arg, i) => {
    const prev = args[i - 1];
    // Value after a path flag (space-separated: -o foo)
    if (prev && PATH_FLAGS.has(prev) && arg && !path.isAbsolute(arg)) {
      return path.resolve(userCwd, arg);
    }
    // Equals-style path flag (--output-dir=foo)
    for (const flag of PATH_FLAGS) {
      if (arg.startsWith(flag + '=')) {
        const val = arg.slice(flag.length + 1);
        if (val && !path.isAbsolute(val)) {
          return flag + '=' + path.resolve(userCwd, val);
        }
      }
    }
    // Positional arg that looks like a path (contains / or . but not a flag)
    if (!arg.startsWith('-') && (arg.includes('/') || arg.includes('.')) && !arg.startsWith('http')) {
      const resolved = path.resolve(userCwd, arg);
      if (fs.existsSync(resolved)) {
        return resolved;
      }
    }
    return arg;
  });

  const fullArgs = [...baseArgs, ...resolvedUserArgs];

  // Resolve the executable
  let executable = cmd;
  if (cmd === 'python3') {
    // python3 -m module: use venv python if available
    const venvPython = path.join(capDir, '.venv', 'bin', 'python3');
    if (fs.existsSync(venvPython)) {
      executable = venvPython;
    }
  } else if (cmd !== 'node') {
    // Check if it's a CLI command installed in venv/bin
    const venvBin = path.join(capDir, '.venv', 'bin', cmd);
    if (fs.existsSync(venvBin)) {
      executable = venvBin;
    }
  }

  if (cmd === 'node') {
    // Node projects: resolve entry script relative to capability dir
    const nodeArgs = fullArgs.map((a, i) => {
      if (i === 0 && !a.startsWith('/') && !a.startsWith('-')) {
        return path.join(capDir, a);
      }
      return a;
    });
    try {
      execFileSync(executable, nodeArgs, { cwd: capDir, stdio: 'inherit' });
    } catch (err) {
      process.exit(err.status || 1);
    }
    return;
  }

  try {
    execFileSync(executable, fullArgs, { cwd: capDir, stdio: 'inherit' });
  } catch (err) {
    process.exit(err.status || 1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  if (command === 'list') {
    showList(args.includes('--installed'));
    return;
  }

  if (command === 'install') {
    const name = args[1];
    if (!name) { console.error('Usage: content install <capability>'); process.exit(1); }
    install(name);
    return;
  }

  if (command === 'update') {
    const name = args[1];
    if (!name) { console.error('Usage: content update <capability>'); process.exit(1); }
    update(name);
    return;
  }

  if (command === 'remove') {
    const name = args[1];
    if (!name) { console.error('Usage: content remove <capability>'); process.exit(1); }
    remove(name);
    return;
  }

  // Route to capability
  runCapability(command, args.slice(1));
}

main();
