const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCommandPlan,
  validateCapabilityArgs,
  normalizeCapabilityName,
  getCapabilityUsageHint,
  normalizeCapabilityArgs,
} = require('../cli.js');

test('normalizeCapabilityName maps xhs alias to xiaohongshu', () => {
  assert.equal(normalizeCapabilityName('xhs'), 'xiaohongshu');
});

test('normalizeCapabilityName maps intelligence alias to analyze', () => {
  assert.equal(normalizeCapabilityName('intelligence'), 'analyze');
});

test('normalizeCapabilityName leaves known capability names unchanged', () => {
  assert.equal(normalizeCapabilityName('publish'), 'publish');
  assert.equal(normalizeCapabilityName('download'), 'download');
  assert.equal(normalizeCapabilityName('analyze'), 'analyze');
});

test('getCapabilityUsageHint returns publish help when no subcommand is given', () => {
  const hint = getCapabilityUsageHint('publish', []);
  assert.match(hint, /content publish <平台子命令>/);
  assert.match(hint, /upload-video/);
});

test('getCapabilityUsageHint returns xiaohongshu help when no subcommand is given', () => {
  const hint = getCapabilityUsageHint('xiaohongshu', []);
  assert.match(hint, /content xiaohongshu <子命令>/);
  assert.match(hint, /search-feeds/);
});

test('getCapabilityUsageHint returns download help when no URL is given', () => {
  const hint = getCapabilityUsageHint('download', []);
  assert.match(hint, /content download <URL>/);
  assert.match(hint, /fetch-cookies/);
});

test('getCapabilityUsageHint returns analyze help when no mode is given', () => {
  const hint = getCapabilityUsageHint('analyze', []);
  assert.match(hint, /content analyze <模式>/);
  assert.match(hint, /extract <内容目录>/);
  assert.match(hint, /trends/);
});

test('getCapabilityUsageHint returns rewrite help when no input is given', () => {
  const hint = getCapabilityUsageHint('rewrite', []);
  assert.match(hint, /content rewrite <内容目录或文本文件>/);
  assert.match(hint, /--from/);
  assert.match(hint, /--to/);
});

test('getCapabilityUsageHint returns rewrite preset help when preset name is missing', () => {
  const hint = getCapabilityUsageHint('rewrite', ['preset']);
  assert.match(hint, /content rewrite preset <预设>/);
  assert.match(hint, /xiaohongshu-note/);
});

test('getCapabilityUsageHint returns videocut help when no subcommand is given', () => {
  const hint = getCapabilityUsageHint('videocut', []);
  assert.match(hint, /content videocut <子命令> <视频文件>/);
  assert.match(hint, /transcribe/);
});

test('getCapabilityUsageHint returns videocut preset help when preset name is missing', () => {
  const hint = getCapabilityUsageHint('videocut', ['preset']);
  assert.match(hint, /content videocut preset <预设>/);
  assert.match(hint, /short-form/);
  assert.match(hint, /subtitle-hook/);
});

test('getCapabilityUsageHint returns null when capability args are sufficient to continue', () => {
  assert.equal(getCapabilityUsageHint('publish', ['xiaohongshu', 'upload-video']), null);
  assert.equal(getCapabilityUsageHint('xiaohongshu', ['check-login']), null);
});

test('buildCommandPlan routes publish batch to the local batch-publish script', () => {
  const plan = buildCommandPlan('publish', ['batch', 'manifest.json', '--account', 'creator']);
  assert.equal(plan.executable, 'python3');
  assert.match(plan.args[0], /scripts\/batch-publish\.py$/);
  assert.deepEqual(plan.args.slice(1), ['manifest.json', '--account', 'creator']);
});

test('buildCommandPlan routes analyze extract to the extract capability', () => {
  const plan = buildCommandPlan('analyze', ['extract', 'raw/']);
  assert.deepEqual(plan, {
    routeTo: 'extract',
    args: ['raw/'],
  });
});

test('buildCommandPlan routes analyze transcribe to videocut transcribe', () => {
  const plan = buildCommandPlan('analyze', ['transcribe', 'input.mp4']);
  assert.deepEqual(plan, {
    routeTo: 'videocut',
    args: ['transcribe', 'input.mp4'],
  });
});

test('buildCommandPlan routes rewrite preset to canonical rewrite command', () => {
  const plan = buildCommandPlan('rewrite', ['preset', 'xiaohongshu-note', 'draft.md', '--from', 'douyin']);
  assert.deepEqual(plan, {
    rerouteToSelf: 'rewrite',
    args: ['draft.md', '--from', 'douyin', '--to', 'xiaohongshu'],
  });
});

test('buildCommandPlan routes videocut preset to pipeline command', () => {
  const plan = buildCommandPlan('videocut', ['preset', 'short-form', 'input.mp4', '-o', 'output/']);
  assert.deepEqual(plan, {
    rerouteToSelf: 'videocut',
    args: ['pipeline', 'input.mp4', '--steps', 'autocut,speed,subtitle,hook,cover', '-o', 'output/'],
  });
});

test('normalizeCapabilityArgs normalizes publish platform aliases', () => {
  assert.deepEqual(
    normalizeCapabilityArgs('publish', ['xhs', 'upload-video', '--account', 'creator']),
    ['xiaohongshu', 'upload-video', '--account', 'creator']
  );
});

test('normalizeCapabilityArgs normalizes rewrite platform aliases', () => {
  assert.deepEqual(
    normalizeCapabilityArgs('rewrite', [__filename, '--from', 'xhs', '--to', 'wx,twitter']),
    [__filename, '--from', 'xiaohongshu', '--to', 'wechat,x']
  );
});

test('validateCapabilityArgs catches missing publish account', () => {
  const msg = validateCapabilityArgs('publish', ['xiaohongshu', 'upload-video', '--file', 'demo.mp4', '--title', '标题', '--desc', '描述']);
  assert.match(msg, /缺少 --account/);
});

test('validateCapabilityArgs catches missing batch publish account', () => {
  const msg = validateCapabilityArgs('publish', ['batch', __filename]);
  assert.match(msg, /缺少 --account/);
});

test('validateCapabilityArgs catches missing publish video file', () => {
  const msg = validateCapabilityArgs('publish', ['xiaohongshu', 'upload-video', '--account', 'creator', '--title', '标题', '--desc', '描述']);
  assert.match(msg, /缺少 --file/);
});

test('validateCapabilityArgs catches missing publish note images', () => {
  const msg = validateCapabilityArgs('publish', ['xiaohongshu', 'upload-note', '--account', 'creator', '--title', '标题', '--note', '正文']);
  assert.match(msg, /缺少 --images/);
});

test('validateCapabilityArgs catches missing xiaohongshu search keyword', () => {
  const msg = validateCapabilityArgs('xiaohongshu', ['search-feeds']);
  assert.match(msg, /缺少 --keyword/);
});

test('validateCapabilityArgs catches missing xiaohongshu publish video path', () => {
  const msg = validateCapabilityArgs('xiaohongshu', ['publish-video', '--title-file', __filename, '--content-file', __filename]);
  assert.match(msg, /缺少 --video/);
});

test('validateCapabilityArgs catches missing local file paths when a publish file does not exist', () => {
  const msg = validateCapabilityArgs(
    'publish',
    ['xiaohongshu', 'upload-video', '--account', 'creator', '--file', 'missing.mp4', '--title', '标题', '--desc', '描述'],
    '/tmp'
  );
  assert.match(msg, /文件不存在/);
  assert.match(msg, /missing\.mp4/);
});

test('validateCapabilityArgs accepts a fully specified publish video command shape', () => {
  const msg = validateCapabilityArgs(
    'publish',
    ['xhs', 'upload-video', '--account', 'creator', '--file', __filename, '--title', '标题', '--desc', '描述'],
    process.cwd()
  );
  assert.equal(msg, null);
});

test('validateCapabilityArgs accepts fetch-cookies as a valid download action', () => {
  const msg = validateCapabilityArgs('download', ['fetch-cookies']);
  assert.equal(msg, null);
});

test('validateCapabilityArgs accepts analyze trends without an input path', () => {
  const msg = validateCapabilityArgs('analyze', ['trends']);
  assert.equal(msg, null);
});

test('validateCapabilityArgs catches missing analyze directory for hooks mode', () => {
  const msg = validateCapabilityArgs('analyze', ['hooks']);
  assert.match(msg, /缺少内容目录/);
});

test('validateCapabilityArgs catches unsupported analyze mode', () => {
  const msg = validateCapabilityArgs('analyze', ['mystery-mode']);
  assert.match(msg, /不支持的 analyze 模式/);
});

test('validateCapabilityArgs catches missing download URL', () => {
  const msg = validateCapabilityArgs('download', []);
  assert.match(msg, /content download <URL>/);
});

test('validateCapabilityArgs catches non-url download input', () => {
  const msg = validateCapabilityArgs('download', ['not-a-url']);
  assert.match(msg, /下载需要一个 URL/);
});

test('validateCapabilityArgs catches missing extract input directory', () => {
  const msg = validateCapabilityArgs('extract', []);
  assert.match(msg, /缺少内容目录/);
});

test('validateCapabilityArgs rejects extract input when it is a file not a directory', () => {
  const msg = validateCapabilityArgs('extract', [__filename], process.cwd());
  assert.match(msg, /需要目录/);
});

test('validateCapabilityArgs catches missing rewrite source platform', () => {
  const msg = validateCapabilityArgs('rewrite', [__filename, '--to', 'xiaohongshu'], process.cwd());
  assert.match(msg, /缺少 --from/);
});

test('validateCapabilityArgs catches missing rewrite preset name', () => {
  const msg = validateCapabilityArgs('rewrite', ['preset'], process.cwd());
  assert.match(msg, /缺少 rewrite preset 名称/);
});

test('validateCapabilityArgs catches unsupported rewrite preset', () => {
  const msg = validateCapabilityArgs('rewrite', ['preset', 'viral-post', __filename, '--from', 'douyin'], process.cwd());
  assert.match(msg, /不支持的 rewrite preset/);
});

test('validateCapabilityArgs catches missing rewrite target platform', () => {
  const msg = validateCapabilityArgs('rewrite', [__filename, '--from', 'douyin'], process.cwd());
  assert.match(msg, /缺少 --to/);
});

test('validateCapabilityArgs catches missing rewrite input file or directory', () => {
  const msg = validateCapabilityArgs('rewrite', ['missing.md', '--from', 'douyin', '--to', 'xiaohongshu'], '/tmp');
  assert.match(msg, /文件不存在/);
});

test('validateCapabilityArgs catches missing videocut input file', () => {
  const msg = validateCapabilityArgs('videocut', ['transcribe']);
  assert.match(msg, /缺少视频文件/);
});

test('validateCapabilityArgs catches missing videocut preset name', () => {
  const msg = validateCapabilityArgs('videocut', ['preset']);
  assert.match(msg, /缺少 videocut preset 名称/);
});

test('validateCapabilityArgs catches unsupported videocut preset', () => {
  const msg = validateCapabilityArgs('videocut', ['preset', 'hyper-edit', __filename], process.cwd());
  assert.match(msg, /不支持的 videocut preset/);
});

test('validateCapabilityArgs catches missing videocut pipeline steps', () => {
  const msg = validateCapabilityArgs('videocut', ['pipeline', __filename], process.cwd());
  assert.match(msg, /缺少 --steps/);
});

test('validateCapabilityArgs accepts a valid rewrite command shape', () => {
  const msg = validateCapabilityArgs('rewrite', [__filename, '--from', 'douyin', '--to', 'xiaohongshu'], process.cwd());
  assert.equal(msg, null);
});

test('validateCapabilityArgs catches unsupported rewrite target platform', () => {
  const msg = validateCapabilityArgs('rewrite', [__filename, '--from', 'douyin', '--to', 'marsbook'], process.cwd());
  assert.match(msg, /不支持的目标平台/);
});

test('validateCapabilityArgs catches unsupported videocut subcommand', () => {
  const msg = validateCapabilityArgs('videocut', ['magic-cut', __filename], process.cwd());
  assert.match(msg, /不支持的 videocut 子命令/);
});
