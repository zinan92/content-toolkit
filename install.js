// install.js — Registry-driven capability installer (v2)
// Resolves, installs, updates, and health-checks capabilities via registry.v2.json.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const TOOLKIT_DIR = path.dirname(__filename);
const CAPS_DIR = path.join(TOOLKIT_DIR, 'capabilities');
const META_DIR = path.join(CAPS_DIR, '.meta');
const REGISTRY_PATH = path.join(TOOLKIT_DIR, 'registry.v2.json');

// --- Registry ---

function loadRegistry() {
  const raw = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  return raw.capabilities;
}

function getCapability(name) {
  const registry = loadRegistry();
  const cap = registry[name];
  if (!cap) {
    throw new Error(`Unknown capability: "${name}". Run "content list" to see available.`);
  }
  return cap;
}

// --- Install state ---

function capabilityPath(name) {
  return path.join(CAPS_DIR, name);
}

function isInstalled(name) {
  return fs.existsSync(path.join(CAPS_DIR, name));
}

function metaPath(name) {
  return path.join(META_DIR, `${name}.json`);
}

function readMeta(name) {
  const p = metaPath(name);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeMeta(name, meta) {
  fs.mkdirSync(META_DIR, { recursive: true });
  fs.writeFileSync(metaPath(name), JSON.stringify(meta, null, 2) + '\n');
}

// --- Health ---

const HEALTH = { NOT_INSTALLED: 'not_installed', INSTALLED: 'installed', DEGRADED: 'degraded', UNAVAILABLE: 'unavailable' };

function checkHealth(name) {
  if (!isInstalled(name)) return HEALTH.NOT_INSTALLED;

  const cap = getCapability(name);
  const capDir = capabilityPath(name);

  // Check entrypoint resolves
  const [cmd] = cap.entrypoint.split(' ');
  if (cmd === 'node') {
    // Node: check cli.js exists
    const entryFile = cap.entrypoint.split(' ')[1] || 'cli.js';
    if (!fs.existsSync(path.join(capDir, entryFile))) return HEALTH.DEGRADED;
  } else if (cmd === 'python3') {
    // Python module: check venv exists
    const venvPython = path.join(capDir, '.venv', 'bin', 'python3');
    if (!fs.existsSync(venvPython)) return HEALTH.DEGRADED;
  } else {
    // Named CLI: check in venv/bin or PATH
    const venvBin = path.join(capDir, '.venv', 'bin', cmd);
    if (!fs.existsSync(venvBin)) {
      try {
        execFileSync('which', [cmd], { stdio: 'pipe' });
      } catch {
        return HEALTH.DEGRADED;
      }
    }
  }

  // Check for known issues
  if (cap.known_issues && cap.known_issues.length > 0) return HEALTH.DEGRADED;

  return HEALTH.INSTALLED;
}

// --- Dependency check ---

function checkDependencies(deps) {
  const missing = [];
  for (const dep of deps || []) {
    try {
      execFileSync('which', [dep], { stdio: 'pipe' });
    } catch {
      missing.push(dep);
    }
  }
  return missing;
}

// --- Install ---

function install(name) {
  const cap = getCapability(name);

  if (isInstalled(name)) {
    return capabilityPath(name);
  }

  // Check system dependencies
  const missing = checkDependencies(cap.dependencies);
  if (missing.length > 0) {
    console.error(`  Missing dependencies for ${name}: ${missing.join(', ')}`);
    throw new Error(`Missing dependencies: ${missing.join(', ')}`);
  }

  // Clone
  fs.mkdirSync(CAPS_DIR, { recursive: true });
  const dest = capabilityPath(name);
  const repoUrl = `https://github.com/${cap.repo}.git`;
  const ref = cap.primary_ref || 'main';

  console.log(`  Installing ${name} from ${cap.repo}@${ref}...`);
  const cloneArgs = ['clone', '--depth', '1'];
  if (ref !== 'main' && ref !== 'master') {
    cloneArgs.push('--branch', ref);
  }
  cloneArgs.push(repoUrl, dest);

  execFileSync('git', cloneArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

  // Post-install setup
  const setupScript = path.join(dest, 'setup.sh');
  if (fs.existsSync(setupScript)) {
    console.log(`  Running setup...`);
    execFileSync('bash', [setupScript], { cwd: dest, stdio: 'inherit' });
  }

  // Python projects: create venv + install deps
  if (cap.install.python_deps) {
    const requirements = path.join(dest, 'requirements.txt');
    const pyproject = path.join(dest, 'pyproject.toml');
    if (fs.existsSync(requirements) || fs.existsSync(pyproject)) {
      console.log(`  Installing Python dependencies...`);
      const venvPath = path.join(dest, '.venv');
      execFileSync('python3', ['-m', 'venv', venvPath], { cwd: dest });
      const pip = path.join(venvPath, 'bin', 'pip');
      if (fs.existsSync(requirements)) {
        execFileSync(pip, ['install', '-r', 'requirements.txt'], {
          cwd: dest, stdio: ['pipe', 'pipe', 'pipe'],
        });
      } else {
        execFileSync(pip, ['install', '-e', '.'], {
          cwd: dest, stdio: ['pipe', 'pipe', 'pipe'],
        });
      }
    }
  }

  // Node projects: npm install
  if (cap.install.node_deps) {
    const packageJson = path.join(dest, 'package.json');
    if (fs.existsSync(packageJson)) {
      console.log(`  Installing Node dependencies...`);
      execFileSync('npm', ['install', '--production'], { cwd: dest, stdio: ['pipe', 'pipe', 'pipe'] });
    }
  }

  // Get installed ref
  let installedRef = 'unknown';
  try {
    installedRef = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: dest, encoding: 'utf8',
    }).trim();
  } catch { /* ignore */ }

  // Write install metadata
  const health = checkHealth(name);
  writeMeta(name, {
    installed_ref: installedRef,
    installed_at: new Date().toISOString(),
    source: 'primary',
    health,
    last_verified: new Date().toISOString(),
  });

  console.log(`  Installed: ${name} (${installedRef}) [${health}]`);
  return dest;
}

// --- Update ---

function update(name) {
  if (!isInstalled(name)) {
    throw new Error(`${name} is not installed. Run "content ${name}" to install it.`);
  }
  const dest = capabilityPath(name);
  console.log(`  Updating ${name}...`);
  execFileSync('git', ['pull', '--rebase'], { cwd: dest, stdio: 'inherit' });

  // Re-check health after update
  let installedRef = 'unknown';
  try {
    installedRef = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: dest, encoding: 'utf8',
    }).trim();
  } catch { /* ignore */ }

  const health = checkHealth(name);
  writeMeta(name, {
    installed_ref: installedRef,
    installed_at: new Date().toISOString(),
    source: 'primary',
    health,
    last_verified: new Date().toISOString(),
  });

  console.log(`  Updated: ${name} (${installedRef}) [${health}]`);
}

// --- Remove ---

function remove(name) {
  const dest = capabilityPath(name);
  if (!fs.existsSync(dest)) {
    console.log(`  ${name} is not installed.`);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });

  // Clean meta
  const mp = metaPath(name);
  if (fs.existsSync(mp)) fs.rmSync(mp);

  console.log(`  Removed: ${name}`);
}

module.exports = {
  loadRegistry,
  getCapability,
  isInstalled,
  install,
  update,
  remove,
  capabilityPath,
  checkDependencies,
  checkHealth,
  readMeta,
  HEALTH,
};
