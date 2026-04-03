#!/usr/bin/env node
// cli.js — Unified entry: content <capability> [args]

const { execFileSync, execFile } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { loadRegistry, isInstalled, install, capabilityPath, update, remove } = require('./install');

const CAPABILITY_ALIASES = {
  xhs: 'xiaohongshu',
  intelligence: 'analyze',
};

function normalizeCapabilityName(name) {
  return CAPABILITY_ALIASES[name] || name;
}

function getCapabilityUsageHint(name, args) {
  if (name === 'download' && args.length === 0) {
    return [
      'download 需要一个可下载的目标。试试这些：',
      '  content download <URL>',
      '  content download https://douyin.com/video/xxx',
      '  content download https://xiaohongshu.com/explore/xxx',
      '  content download fetch-cookies',
    ].join('\n');
  }

  if (name === 'extract' && args.length === 0) {
    return [
      'extract 需要一个内容目录。试试这些：',
      '  content extract <内容目录>',
      '  content extract ./output/douyin/user/video123/',
    ].join('\n');
  }

  if (name === 'analyze' && args.length === 0) {
    return [
      'analyze 需要一个分析模式。试试这些：',
      '  content analyze <模式>',
      '  content analyze extract <内容目录>',
      '  content analyze transcribe input.mp4',
      '  content analyze trends',
      '  content analyze hooks ./output/douyin/user/video123/',
    ].join('\n');
  }

  if (name === 'rewrite' && args.length === 0) {
    return [
      'rewrite 需要输入内容和平台信息。试试这些：',
      '  content rewrite <内容目录或文本文件> --from <来源> --to <目标>',
      '  content rewrite ./output/video123/ --from douyin --to xiaohongshu',
    ].join('\n');
  }

  if (name === 'videocut' && args.length === 0) {
    return [
      'videocut 需要子命令和视频文件。试试这些：',
      '  content videocut <子命令> <视频文件>',
      '  content videocut transcribe input.mp4',
      '  content videocut pipeline input.mp4 --steps autocut,subtitle',
    ].join('\n');
  }

  if (name === 'publish' && args.length === 0) {
    return [
      'publish 需要更具体的目标。试试这些：',
      '  content publish <平台子命令>',
      '  content publish xiaohongshu upload-video --account creator --file demo.mp4 --title "标题" --desc "描述"',
      '  content publish xiaohongshu upload-note --account creator --images 1.jpg 2.jpg --title "标题" --note "正文"',
      '  content publish batch manifest.json --account creator --dry-run',
    ].join('\n');
  }

  if (name === 'xiaohongshu' && args.length === 0) {
    return [
      'xiaohongshu 需要一个站内动作。试试这些：',
      '  content xiaohongshu <子命令>',
      '  content xiaohongshu check-login',
      '  content xiaohongshu login',
      '  content xiaohongshu search-feeds --keyword "露营"',
      '  content xiaohongshu publish --title-file title.txt --content-file body.txt --images /abs/path/1.jpg',
    ].join('\n');
  }

  return null;
}

function getFlagValue(args, flag) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === flag) {
      return args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : null;
    }
    if (arg.startsWith(flag + '=')) {
      return arg.slice(flag.length + 1) || null;
    }
  }
  return null;
}

function getMultiFlagValues(args, flag) {
  const values = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === flag) {
      let j = i + 1;
      while (j < args.length && !args[j].startsWith('-')) {
        values.push(args[j]);
        j += 1;
      }
      return values;
    }
    if (arg.startsWith(flag + '=')) {
      const value = arg.slice(flag.length + 1);
      if (value) values.push(value);
      return values;
    }
  }
  return values;
}

function resolveInputPath(filePath, cwd) {
  if (!filePath) return null;
  return path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
}

function missingFlagMessage(flag, example) {
  return `缺少 ${flag}。${example}`;
}

function fileNotFoundMessage(label, filePath) {
  return `${label}文件不存在：${filePath}`;
}

function isLikelyUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function validatePublishArgs(args, cwd) {
  const platform = normalizeCapabilityName(args[0]);
  const action = args[1];
  if (!platform || !action) {
    return 'publish 需要平台和动作，例如：content publish xiaohongshu upload-video ...';
  }

  if (platform === 'batch') {
    const manifest = args[1];
    if (!manifest) {
      return 'publish batch 需要 manifest 文件，例如：content publish batch manifest.json --account creator --dry-run';
    }
    const resolvedManifest = resolveInputPath(manifest, cwd);
    if (!fs.existsSync(resolvedManifest)) {
      return fileNotFoundMessage('manifest', resolvedManifest);
    }
    if (!getFlagValue(args, '--account')) {
      return missingFlagMessage('--account', '批量发布需要指定账号。');
    }
    return null;
  }

  if (action === 'upload-video') {
    const account = getFlagValue(args, '--account');
    if (!account) {
      return missingFlagMessage('--account', '先指定要用哪个账号发布。');
    }
    const file = getFlagValue(args, '--file');
    if (!file) {
      return missingFlagMessage('--file', '视频发布至少要给一个本地视频文件。');
    }
    const resolvedFile = resolveInputPath(file, cwd);
    if (!fs.existsSync(resolvedFile)) {
      return fileNotFoundMessage('视频', resolvedFile);
    }
    if (!getFlagValue(args, '--title')) {
      return missingFlagMessage('--title', '视频发布需要标题。');
    }
    if (!getFlagValue(args, '--desc')) {
      return missingFlagMessage('--desc', '视频发布需要描述文案。');
    }
  }

  if (action === 'upload-note') {
    const account = getFlagValue(args, '--account');
    if (!account) {
      return missingFlagMessage('--account', '先指定要用哪个账号发布。');
    }
    const images = getMultiFlagValues(args, '--images');
    if (images.length === 0) {
      return missingFlagMessage('--images', '图文发布至少要给一张图片。');
    }
    for (const image of images) {
      const resolvedImage = resolveInputPath(image, cwd);
      if (!fs.existsSync(resolvedImage)) {
        return fileNotFoundMessage('图片', resolvedImage);
      }
    }
    if (!getFlagValue(args, '--title')) {
      return missingFlagMessage('--title', '图文发布需要标题。');
    }
    if (!getFlagValue(args, '--note')) {
      return missingFlagMessage('--note', '图文发布需要正文。');
    }
  }

  return null;
}

function validateDownloadArgs(args) {
  const input = args[0];
  if (!input) {
    return '缺少可下载的 URL。试试：content download <URL>';
  }
  if (input === 'fetch-cookies') {
    return null;
  }
  if (!isLikelyUrl(input)) {
    return '下载需要一个 URL，或者使用 content download fetch-cookies 获取 cookies。';
  }
  return null;
}

function validateExtractArgs(args, cwd) {
  const input = args[0];
  if (!input) {
    return '缺少内容目录。试试：content extract <内容目录>';
  }
  const resolvedInput = resolveInputPath(input, cwd);
  if (!fs.existsSync(resolvedInput)) {
    return fileNotFoundMessage('内容目录', resolvedInput);
  }
  if (!fs.statSync(resolvedInput).isDirectory()) {
    return `extract 需要目录，不接受单个文件：${resolvedInput}`;
  }
  return null;
}

function validateRewriteArgs(args, cwd) {
  const input = args[0];
  if (!input) {
    return '缺少输入内容。试试：content rewrite <内容目录或文本文件> --from douyin --to xiaohongshu';
  }
  const resolvedInput = resolveInputPath(input, cwd);
  if (!fs.existsSync(resolvedInput)) {
    return fileNotFoundMessage('输入', resolvedInput);
  }
  if (!getFlagValue(args, '--from')) {
    return missingFlagMessage('--from', '改写前要说明来源平台。');
  }
  if (!getFlagValue(args, '--to')) {
    return missingFlagMessage('--to', '改写前要说明目标平台。');
  }
  return null;
}

function validateVideocutArgs(args, cwd) {
  const action = args[0];
  if (!action) {
    return '缺少 videocut 子命令。试试：content videocut transcribe input.mp4';
  }

  const actionsNeedVideoInput = new Set(['transcribe', 'autocut', 'subtitle', 'hook', 'clip', 'cover', 'speed', 'pipeline']);
  if (actionsNeedVideoInput.has(action)) {
    const input = args[1];
    if (!input || input.startsWith('-')) {
      return '缺少视频文件。请在子命令后提供本地视频路径。';
    }
    const resolvedInput = resolveInputPath(input, cwd);
    if (!fs.existsSync(resolvedInput)) {
      return fileNotFoundMessage('视频', resolvedInput);
    }
  }

  if (action === 'pipeline' && !getFlagValue(args, '--steps')) {
    return missingFlagMessage('--steps', 'pipeline 需要指定步骤列表。');
  }

  return null;
}

function validateXiaohongshuArgs(args, cwd) {
  const action = args[0];
  if (!action) {
    return 'xiaohongshu 需要一个站内动作，例如：content xiaohongshu search-feeds --keyword "露营"';
  }

  if (action === 'search-feeds' && !getFlagValue(args, '--keyword')) {
    return missingFlagMessage('--keyword', '搜索笔记时必须提供关键词。');
  }

  if (['get-feed-detail', 'like-feed', 'favorite-feed'].includes(action)) {
    if (!getFlagValue(args, '--feed-id')) {
      return missingFlagMessage('--feed-id', '这个动作需要 feed id。');
    }
    if (!getFlagValue(args, '--xsec-token')) {
      return missingFlagMessage('--xsec-token', '这个动作需要 xsec token。');
    }
  }

  if (action === 'post-comment') {
    if (!getFlagValue(args, '--feed-id')) {
      return missingFlagMessage('--feed-id', '评论时需要 feed id。');
    }
    if (!getFlagValue(args, '--xsec-token')) {
      return missingFlagMessage('--xsec-token', '评论时需要 xsec token。');
    }
    if (!getFlagValue(args, '--content')) {
      return missingFlagMessage('--content', '评论时需要评论正文。');
    }
  }

  if (action === 'publish') {
    const titleFile = getFlagValue(args, '--title-file');
    if (!titleFile) {
      return missingFlagMessage('--title-file', '图文发布需要标题文件。');
    }
    const resolvedTitle = resolveInputPath(titleFile, cwd);
    if (!fs.existsSync(resolvedTitle)) {
      return fileNotFoundMessage('标题', resolvedTitle);
    }

    const contentFile = getFlagValue(args, '--content-file');
    if (!contentFile) {
      return missingFlagMessage('--content-file', '图文发布需要正文文件。');
    }
    const resolvedContent = resolveInputPath(contentFile, cwd);
    if (!fs.existsSync(resolvedContent)) {
      return fileNotFoundMessage('正文', resolvedContent);
    }

    const images = getMultiFlagValues(args, '--images');
    if (images.length === 0) {
      return missingFlagMessage('--images', '图文发布至少要给一张图片。');
    }
    for (const image of images) {
      const resolvedImage = resolveInputPath(image, cwd);
      if (!fs.existsSync(resolvedImage)) {
        return fileNotFoundMessage('图片', resolvedImage);
      }
    }
  }

  if (action === 'publish-video') {
    const titleFile = getFlagValue(args, '--title-file');
    if (!titleFile) {
      return missingFlagMessage('--title-file', '视频发布需要标题文件。');
    }
    const resolvedTitle = resolveInputPath(titleFile, cwd);
    if (!fs.existsSync(resolvedTitle)) {
      return fileNotFoundMessage('标题', resolvedTitle);
    }

    const contentFile = getFlagValue(args, '--content-file');
    if (!contentFile) {
      return missingFlagMessage('--content-file', '视频发布需要正文文件。');
    }
    const resolvedContent = resolveInputPath(contentFile, cwd);
    if (!fs.existsSync(resolvedContent)) {
      return fileNotFoundMessage('正文', resolvedContent);
    }

    const video = getFlagValue(args, '--video');
    if (!video) {
      return missingFlagMessage('--video', '视频发布需要本地视频文件。');
    }
    const resolvedVideo = resolveInputPath(video, cwd);
    if (!fs.existsSync(resolvedVideo)) {
      return fileNotFoundMessage('视频', resolvedVideo);
    }
  }

  return null;
}

function validateCapabilityArgs(name, args, cwd = process.cwd()) {
  if (name === 'download') {
    return validateDownloadArgs(args, cwd);
  }

  if (name === 'extract') {
    return validateExtractArgs(args, cwd);
  }

  if (name === 'rewrite') {
    return validateRewriteArgs(args, cwd);
  }

  if (name === 'videocut') {
    return validateVideocutArgs(args, cwd);
  }

  if (name === 'publish') {
    return validatePublishArgs(args, cwd);
  }

  if (name === 'xiaohongshu') {
    return validateXiaohongshuArgs(args, cwd);
  }

  return null;
}

function buildCommandPlan(name, args) {
  if (name === 'analyze' && args[0] === 'extract') {
    return {
      routeTo: 'extract',
      args: args.slice(1),
    };
  }

  if (name === 'analyze' && args[0] === 'transcribe') {
    return {
      routeTo: 'videocut',
      args: ['transcribe', ...args.slice(1)],
    };
  }

  if (name === 'publish' && args[0] === 'batch') {
    return {
      executable: 'python3',
      args: [path.join(__dirname, 'scripts', 'batch-publish.py'), ...args.slice(1)],
      cwd: __dirname,
    };
  }

  return null;
}

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

分析趋势/内容判断      content analyze <模式>
  从目录提取文字        content analyze extract ./output/douyin/user/video123/
  单视频转录            content analyze transcribe input.mp4
  看趋势/选题           content analyze trends
  看 hook/结构          content analyze hooks ./output/douyin/user/video123/

  ⚠️  analyze 是统一分析入口
      content intelligence 仍可用，但现在是兼容别名

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

小红书原生操作         content xiaohongshu <子命令>
  检查登录状态          content xiaohongshu check-login
  登录小红书            content xiaohongshu login
  搜索笔记              content xiaohongshu search-feeds --keyword "露营"
  发布图文              content xiaohongshu publish --title-file title.txt --content-file body.txt --images /abs/path/1.jpg
  发布视频              content xiaohongshu publish-video --title-file title.txt --content-file body.txt --video /abs/path/demo.mp4

多平台发布             content publish <平台子命令>
  小红书发布视频         content publish xiaohongshu upload-video --account creator --file demo.mp4 --title "标题" --desc "描述"
  小红书发布图文         content publish xiaohongshu upload-note --account creator --images 1.jpg 2.jpg --title "标题" --note "正文"
  批量定时发布           content publish batch manifest.json --account creator --dry-run

─────────────────────────────────────────────────────────────────
典型工作流:
  1. 下载  content download https://douyin.com/video/xxx --cookies cookies.json
  2. 分析  content analyze extract ./output/douyin/user/video123/
  3. 改写  content rewrite ./output/douyin/user/video123/ --from douyin --to xiaohongshu
  4. 发布  content publish xiaohongshu upload-video --account creator --file video.mp4 --title "标题" --desc "描述"

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
  const normalizedName = normalizeCapabilityName(name);
  const commandPlan = buildCommandPlan(normalizedName, args);
  const registry = loadRegistry();
  const cap = registry[normalizedName];
  if (!cap) {
    // Check if user passed a URL directly (common mistake)
    if (name.startsWith('http://') || name.startsWith('https://')) {
      console.error(`看起来你想下载内容？试试:\n  content download ${name}\n`);
    } else if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.mp3')) {
      console.error(`看起来你想处理一个视频/音频文件？试试:\n  content videocut transcribe ${name}   # 转文字\n  content videocut autocut ${name}     # 去废话\n  content videocut subtitle ${name}    # 加字幕\n`);
    } else {
      console.error(`未知命令: "${name}"\n运行 content 查看所有可用命令。可用主能力包括 download、extract、analyze、rewrite、videocut、publish、xiaohongshu。`);
    }
    process.exit(1);
  }

  const usageHint = getCapabilityUsageHint(normalizedName, args);
  if (usageHint) {
    console.error(usageHint);
    process.exit(1);
  }

  const validationError = validateCapabilityArgs(normalizedName, args, process.cwd());
  if (validationError) {
    console.error(validationError);
    process.exit(1);
  }

  if (commandPlan) {
    if (commandPlan.routeTo) {
      runCapability(commandPlan.routeTo, commandPlan.args);
      return;
    }
    try {
      execFileSync(commandPlan.executable, commandPlan.args, { cwd: commandPlan.cwd, stdio: 'inherit' });
    } catch (err) {
      process.exit(err.status || 1);
    }
    return;
  }

  // Auto-install on first use
  const capDir = install(normalizedName);

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
  const command = normalizeCapabilityName(args[0]);

  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  if (command === 'list') {
    showList(args.includes('--installed'));
    return;
  }

  if (command === 'install') {
    const name = normalizeCapabilityName(args[1]);
    if (!name) { console.error('Usage: content install <capability>'); process.exit(1); }
    install(name);
    return;
  }

  if (command === 'update') {
    const name = normalizeCapabilityName(args[1]);
    if (!name) { console.error('Usage: content update <capability>'); process.exit(1); }
    update(name);
    return;
  }

  if (command === 'remove') {
    const name = normalizeCapabilityName(args[1]);
    if (!name) { console.error('Usage: content remove <capability>'); process.exit(1); }
    remove(name);
    return;
  }

  // Route to capability
  runCapability(command, args.slice(1));
}

if (require.main === module) {
  main();
}

module.exports = {
  buildCommandPlan,
  getCapabilityUsageHint,
  normalizeCapabilityName,
  validateCapabilityArgs,
  runCapability,
  showHelp,
  showList,
};
