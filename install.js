// install.js — Lazy capability installer
// Clones a capability repo into capabilities/ on first use

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const TOOLKIT_DIR = path.dirname(__filename);
const CAPS_DIR = path.join(TOOLKIT_DIR, 'capabilities');
const REGISTRY_PATH = path.join(TOOLKIT_DIR, 'registry.json');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')).capabilities;
}

function isInstalled(name) {
  return fs.existsSync(path.join(CAPS_DIR, name));
}

function capabilityPath(name) {
  return path.join(CAPS_DIR, name);
}

function checkDependencies(requires) {
  const missing = [];
  for (const dep of requires || []) {
    try {
      execFileSync('which', [dep], { stdio: 'pipe' });
    } catch {
      missing.push(dep);
    }
  }
  return missing;
}

function install(name) {
  const registry = loadRegistry();
  const cap = registry[name];
  if (!cap) {
    throw new Error(`Unknown capability: "${name}". Run "content list" to see available capabilities.`);
  }

  if (isInstalled(name)) {
    return capabilityPath(name);
  }

  // Check dependencies
  const missing = checkDependencies(cap.requires);
  if (missing.length > 0) {
    console.error(`  Missing dependencies for ${name}: ${missing.join(', ')}`);
    console.error(`  Install them before using this capability.`);
    throw new Error(`Missing dependencies: ${missing.join(', ')}`);
  }

  // Clone
  fs.mkdirSync(CAPS_DIR, { recursive: true });
  const dest = capabilityPath(name);
  const repoUrl = `https://github.com/${cap.repo}.git`;

  console.log(`  Installing ${name} from ${cap.repo}...`);
  execFileSync('git', ['clone', '--depth', '1', repoUrl, dest], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Run setup if exists
  const setupScript = path.join(dest, 'setup.sh');
  if (fs.existsSync(setupScript)) {
    console.log(`  Running setup...`);
    execFileSync('bash', [setupScript], { cwd: dest, stdio: 'inherit' });
  }

  // Python projects: create venv + install deps
  const requirements = path.join(dest, 'requirements.txt');
  if (fs.existsSync(requirements)) {
    console.log(`  Installing Python dependencies...`);
    const venvPath = path.join(dest, '.venv');
    execFileSync('python3', ['-m', 'venv', venvPath], { cwd: dest });
    execFileSync(path.join(venvPath, 'bin', 'pip'), ['install', '-r', 'requirements.txt'], {
      cwd: dest,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }

  console.log(`  Installed: ${name}`);
  return dest;
}

function update(name) {
  if (!isInstalled(name)) {
    throw new Error(`${name} is not installed. Run "content ${name}" to install it.`);
  }
  const dest = capabilityPath(name);
  console.log(`  Updating ${name}...`);
  execFileSync('git', ['pull', '--rebase'], { cwd: dest, stdio: 'inherit' });
  console.log(`  Updated: ${name}`);
}

function remove(name) {
  const dest = capabilityPath(name);
  if (!fs.existsSync(dest)) {
    console.log(`  ${name} is not installed.`);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  console.log(`  Removed: ${name}`);
}

module.exports = { loadRegistry, isInstalled, install, update, remove, capabilityPath, checkDependencies };
