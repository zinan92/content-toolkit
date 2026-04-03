// workflows.js — Fixed-formula workflow presets
// Each workflow chains existing capabilities in a deterministic order.
// No LLM routing — just sequential execution with known I/O contracts.

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { install } = require('./install');

const DEFAULT_COOKIES_PATHS = [
  path.join(process.env.HOME || '', '.douyin-cookies.json'),
  'cookies.json',
];

function findDouyinCookies() {
  for (const p of DEFAULT_COOKIES_PATHS) {
    const abs = path.resolve(p);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function runStep(capName, args) {
  const capDir = install(capName);
  const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'registry.v2.json'), 'utf8'));
  const cap = registry.capabilities[capName];
  const [cmd, ...baseArgs] = cap.entrypoint.split(' ');

  const fullArgs = [...baseArgs, ...args];

  let executable = cmd;
  if (cmd === 'python3') {
    const venvPython = path.join(capDir, '.venv', 'bin', 'python3');
    if (fs.existsSync(venvPython)) executable = venvPython;
  } else if (cmd !== 'node') {
    const venvBin = path.join(capDir, '.venv', 'bin', cmd);
    if (fs.existsSync(venvBin)) executable = venvBin;
  }

  if (cmd === 'node') {
    const nodeArgs = fullArgs.map((a, i) => {
      if (i === 0 && !a.startsWith('/') && !a.startsWith('-')) {
        return path.join(capDir, a);
      }
      return a;
    });
    execFileSync(executable, nodeArgs, { cwd: capDir, stdio: 'inherit' });
  } else {
    execFileSync(executable, fullArgs, { cwd: capDir, stdio: 'inherit' });
  }
}

function findContentDir(downloadDir) {
  // Walk: downloadDir/<platform>/<user_id>/<content_id>/
  // Return the first content directory that has media/ inside
  const entries = [];
  function walk(dir, depth) {
    if (depth > 3) return;
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const full = path.join(dir, entry.name);
        if (entry.name === 'media' && depth > 0) {
          entries.push(dir);
          return;
        }
        walk(full, depth + 1);
      }
    } catch { /* ignore permission errors */ }
  }
  walk(downloadDir, 0);
  return entries[0] || null;
}

function douyinToXhs(url, outputDir, cookiesPath) {
  const workdir = path.resolve(outputDir);
  const rawDir = path.join(workdir, 'raw');
  const hooksDir = path.join(workdir, 'hooks');
  const cardsDir = path.join(workdir, 'cards');
  const rewriteDir = path.join(workdir, 'rewrite');
  const publishDir = path.join(workdir, 'publish-ready');

  fs.mkdirSync(workdir, { recursive: true });

  // --- Step 1: Download ---
  console.log('\n═══ Step 1/6: Download ═══');
  const cookies = cookiesPath || findDouyinCookies();
  if (!cookies) {
    console.error('Error: 抖音下载需要 cookies 文件。');
    console.error('提供 --cookies <path> 或把 cookies 放在 ~/.douyin-cookies.json');
    console.error('首次获取: content download fetch-cookies');
    process.exit(1);
  }
  const downloadArgs = [url, '--cookies', cookies, '-o', rawDir];
  runStep('download', downloadArgs);

  // Find the content directory download created
  const contentDir = findContentDir(rawDir);
  if (!contentDir) {
    console.error('Error: 下载完成但找不到内容目录。');
    process.exit(1);
  }
  console.log(`  Content dir: ${contentDir}`);

  // --- Step 2: Extract ---
  console.log('\n═══ Step 2/6: Extract ═══');
  runStep('extract', [contentDir]);

  // Find structured_text.md
  const transcriptPath = path.join(contentDir, 'structured_text.md');
  if (!fs.existsSync(transcriptPath)) {
    console.error('Error: extract 未生成 structured_text.md');
    process.exit(1);
  }

  // Find video file
  const mediaDir = path.join(contentDir, 'media');
  const videoFile = fs.readdirSync(mediaDir).find(f => f.endsWith('.mp4'));
  if (!videoFile) {
    console.error('Error: 找不到视频文件');
    process.exit(1);
  }
  const videoPath = path.join(mediaDir, videoFile);

  // --- Step 3: Hook (extract golden quotes) ---
  console.log('\n═══ Step 3/6: Hook (金句提取) ═══');
  fs.mkdirSync(hooksDir, { recursive: true });

  // Reuse extract's transcript — convert transcript.json to SRT so hook skips whisper
  const extractTranscript = path.join(contentDir, 'transcript.json');
  if (fs.existsSync(extractTranscript)) {
    const data = JSON.parse(fs.readFileSync(extractTranscript, 'utf8'));
    const segments = data.segments || [];
    const srtLines = segments.map((seg, i) => {
      const fmtTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        const ms = Math.round((s % 1) * 1000);
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
      };
      return `${i + 1}\n${fmtTime(seg.start)} --> ${fmtTime(seg.end)}\n${seg.text}\n`;
    });
    fs.writeFileSync(path.join(hooksDir, 'transcript.srt'), srtLines.join('\n'));
    // Also write plain text for the AI prompt
    fs.writeFileSync(path.join(hooksDir, 'transcript.txt'), segments.map(s => s.text).join('\n'));
    console.log('  Reusing transcript from extract (skipping whisper)');
  }

  runStep('videocut', ['hook', videoPath, '-o', hooksDir]);

  const hooksJson = path.join(hooksDir, 'hooks.json');
  if (!fs.existsSync(hooksJson)) {
    console.error('Error: hook 未生成 hooks.json');
    process.exit(1);
  }

  // --- Step 4: Cover (generate quote cards) ---
  console.log('\n═══ Step 4/6: Cover (金句卡片) ═══');
  fs.mkdirSync(cardsDir, { recursive: true });
  runStep('videocut', ['cover', videoPath, '-o', cardsDir, '--quotes', hooksJson]);

  // --- Step 5: Rewrite (XHS copy) ---
  console.log('\n═══ Step 5/6: Rewrite (小红书文案) ═══');
  fs.mkdirSync(rewriteDir, { recursive: true });
  runStep('rewrite', [transcriptPath, '--from', 'douyin', '--to', 'xiaohongshu', '-o', rewriteDir]);

  // Find the rewrite output
  const rewriteFiles = [];
  function findMd(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) findMd(full);
      else if (entry.name.includes('xiaohongshu') && entry.name.endsWith('.md')) {
        rewriteFiles.push(full);
      }
    }
  }
  findMd(rewriteDir);

  const xhsDraft = rewriteFiles[0];
  if (!xhsDraft) {
    console.error('Error: rewrite 未生成小红书文案');
    process.exit(1);
  }

  // --- Step 6: Package ---
  console.log('\n═══ Step 6/6: Package (打包发布) ═══');
  fs.mkdirSync(path.join(publishDir, 'cards'), { recursive: true });

  // Copy XHS draft
  fs.copyFileSync(xhsDraft, path.join(publishDir, 'post_text.md'));

  // Copy cards
  const cardFiles = fs.readdirSync(cardsDir)
    .filter(f => f.endsWith('.png'))
    .sort();
  for (const card of cardFiles) {
    fs.copyFileSync(path.join(cardsDir, card), path.join(publishDir, 'cards', card));
  }

  // Copy cover image if exists
  const coverSrc = path.join(mediaDir, 'cover.jpg');
  if (fs.existsSync(coverSrc)) {
    fs.copyFileSync(coverSrc, path.join(publishDir, 'cover.jpg'));
  }

  // Read source metadata for manifest
  let sourceTitle = '';
  const textFile = path.join(contentDir, 'text.txt');
  if (fs.existsSync(textFile)) {
    sourceTitle = fs.readFileSync(textFile, 'utf8').trim().split('\n')[0];
  }

  // Read XHS draft title
  const draftContent = fs.readFileSync(xhsDraft, 'utf8');
  const titleMatch = draftContent.match(/^#\s+(.+)$/m);
  const postTitle = titleMatch ? titleMatch[1].trim() : sourceTitle;

  // Build manifest
  const manifest = {
    platform: 'xiaohongshu',
    source_url: url,
    source_title: sourceTitle,
    created_at: new Date().toISOString(),
    posts: [
      {
        type: 'image_text',
        title: postTitle,
        text_file: 'post_text.md',
        images: cardFiles.map(f => `cards/${f}`),
        cover: cardFiles[0] ? `cards/${cardFiles[0]}` : 'cover.jpg',
      },
    ],
  };

  fs.writeFileSync(
    path.join(publishDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );

  console.log(`\n✅ 完成! 发布包在: ${publishDir}`);
  console.log(`  manifest.json  — 发布描述`);
  console.log(`  post_text.md   — 小红书文案`);
  console.log(`  cards/         — ${cardFiles.length} 张金句卡片`);
  if (fs.existsSync(path.join(publishDir, 'cover.jpg'))) {
    console.log(`  cover.jpg      — 封面图`);
  }
}

const WORKFLOWS = {
  'douyin-to-xhs': {
    description: '抖音视频 → 小红书图文笔记 (下载→转录→金句→卡片→改写→打包)',
    run: douyinToXhs,
    usage: 'content workflow douyin-to-xhs <url> [-o output/] [--cookies path]',
  },
};

function showWorkflowHelp() {
  console.log('\ncontent workflow — 固定工作流预设\n');
  for (const [name, wf] of Object.entries(WORKFLOWS)) {
    console.log(`  ${name}`);
    console.log(`    ${wf.description}`);
    console.log(`    用法: ${wf.usage}\n`);
  }
}

function runWorkflow(args) {
  const preset = args[0];

  if (!preset || preset === 'help' || preset === '--help') {
    showWorkflowHelp();
    return;
  }

  const wf = WORKFLOWS[preset];
  if (!wf) {
    console.error(`未知工作流: "${preset}"\n`);
    showWorkflowHelp();
    process.exit(1);
  }

  // Parse args: <url> [-o output/] [--cookies path]
  const remaining = args.slice(1);
  let url = null;
  let outputDir = './output';
  let cookiesPath = null;

  for (let i = 0; i < remaining.length; i++) {
    const arg = remaining[i];
    if (arg === '-o' || arg === '--output') {
      outputDir = remaining[++i];
    } else if (arg === '--cookies') {
      cookiesPath = remaining[++i];
    } else if (!arg.startsWith('-')) {
      url = arg;
    }
  }

  if (!url) {
    console.error(`Usage: ${wf.usage}`);
    process.exit(1);
  }

  // Resolve paths to absolute
  outputDir = path.resolve(outputDir);
  if (cookiesPath && !path.isAbsolute(cookiesPath)) {
    cookiesPath = path.resolve(cookiesPath);
  }

  wf.run(url, outputDir, cookiesPath);
}

module.exports = { runWorkflow };
