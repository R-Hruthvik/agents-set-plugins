const fs = require('fs');
const path = require('path');

function readConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return { $schema: 'https://opencode.ai/config.json', agent: {} };
  }
}

function writeConfig(configPath, config) {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

function addAgent(config, name, agentDef) {
  if (!config.agent) config.agent = {};
  config.agent[name] = agentDef;
}

function removeNonDefaultAgents(config, keepNames) {
  if (!config.agent) return;
  for (const key of Object.keys(config.agent)) {
    if (!keepNames.includes(key)) {
      delete config.agent[key];
    }
  }
}

const DEFAULT_AGENTS = ['build', 'plan'];

module.exports = { readConfig, writeConfig, addAgent, removeNonDefaultAgents, DEFAULT_AGENTS };
