const path = require('path');
const os = require('os');
const { adapters, getAdapter } = require('./frameworks');

function detectAllFrameworks(cwd = process.cwd(), homedir = os.homedir()) {
  const detected = [];
  for (const adapter of adapters) {
    const res = adapter.detect(cwd, homedir);
    if (res) {
      detected.push(res);
    }
  }
  return detected;
}

function detectFrameworkByName(nameInput, scopePreference = 'project', cwd = process.cwd(), homedir = os.homedir()) {
  if (!nameInput || !nameInput.trim()) return null;
  const normalized = nameInput.trim().toLowerCase();
  const matchedAdapter = adapters.find(a => 
    a.id === normalized || 
    a.name.toLowerCase().includes(normalized)
  );
  if (!matchedAdapter) return null;

  if (scopePreference === 'global' && matchedAdapter.initGlobal) {
    return matchedAdapter.initGlobal(homedir);
  }

  const existing = matchedAdapter.detect(cwd, homedir);
  if (existing) return existing;
  return matchedAdapter.initProject(cwd);
}

function detectOpenCode() {
  const adapter = getAdapter('opencode');
  return adapter.detect() || adapter.initProject();
}

function getTargetDir(opencode) {
  return path.join(opencode.dir, 'agents');
}

function createProjectConfig() {
  const adapter = getAdapter('opencode');
  return adapter.initProject();
}

module.exports = {
  detectAllFrameworks,
  detectFrameworkByName,
  detectOpenCode,
  getTargetDir,
  createProjectConfig,
};
