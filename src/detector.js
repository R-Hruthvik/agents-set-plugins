const fs = require('fs');
const path = require('path');
const os = require('os');

function detectOpenCode() {
  const candidates = [
    { type: 'project', path: path.join(process.cwd(), '.opencode') },
    { type: 'global', path: path.join(os.homedir(), '.config', 'opencode') },
  ];

  for (const c of candidates) {
    if (fs.existsSync(c.path)) {
      const configPath = path.join(c.path, 'opencode.json');
      return {
        scope: c.type,
        dir: c.path,
        configPath: fs.existsSync(configPath) ? configPath : null,
      };
    }
  }
  return null;
}

function getTargetDir(opencode) {
  return path.join(opencode.dir, 'agents');
}

function createProjectConfig() {
  const dir = path.join(process.cwd(), '.opencode');
  const configPath = path.join(dir, 'opencode.json');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
      $schema: 'https://opencode.ai/config.json',
      agent: {},
    }, null, 2) + '\n');
  }
  return {
    scope: 'project',
    dir,
    configPath,
  };
}

module.exports = { detectOpenCode, getTargetDir, createProjectConfig };
