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
content-toolkit — AI content pipeline capabilities

Usage: content <capability> [args...]

Pipeline stages:
`);

  for (const [name, cap] of sorted) {
    const installed = isInstalled(name) ? '[installed]' : '';
    const subs = cap.subcommands ? ` (${cap.subcommands.join(', ')})` : '';
    console.log(`  ${String(cap.stage).padStart(2)}. ${name.padEnd(14)} ${cap.description}${subs} ${installed}`);
  }

  console.log(`
Management:
  content list              Show all capabilities and install status
  content list --installed  Show only installed capabilities
  content install <name>    Pre-install a capability
  content update <name>     Update an installed capability
  content remove <name>     Remove an installed capability

Examples:
  content download https://douyin.com/video/xxx
  content extract ./downloaded/
  content rewrite ./extracted/transcript.md
  content videocut autocut ./video.mp4 -o output/
  content videocut pipeline ./video.mp4 --steps autocut,subtitle
`);
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
    console.error(`Unknown capability: "${name}". Run "content" for help.`);
    process.exit(1);
  }

  // Auto-install on first use
  const capDir = install(name);

  // Build the command
  const [cmd, ...baseArgs] = cap.entry.split(' ');
  const fullArgs = [...baseArgs, ...args];

  // For Python projects with venv, use the venv python
  let executable = cmd;
  if (cmd === 'python3') {
    const venvPython = path.join(capDir, '.venv', 'bin', 'python3');
    if (fs.existsSync(venvPython)) {
      executable = venvPython;
    }
  } else if (cmd === 'node') {
    // Node projects: resolve entry relative to capability dir
    const resolvedArgs = fullArgs.map((a, i) => {
      if (i === 0 && !a.startsWith('/') && !a.startsWith('-')) {
        return path.join(capDir, a);
      }
      return a;
    });
    try {
      execFileSync(executable, resolvedArgs, { cwd: capDir, stdio: 'inherit' });
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
