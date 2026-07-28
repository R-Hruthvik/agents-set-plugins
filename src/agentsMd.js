const fs = require('fs');
const path = require('path');
const { validateAgentEntry } = require('./agentsMdSchema');

/**
 * Reads agents.md file and returns parsed structure
 * @param {string} filePath - Path to agents.md file
 * @returns {Object} Object with agents array
 */
function readAgentsMd(filePath) {
  if (!fs.existsSync(filePath)) {
    return { agents: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const agents = [];

  // Parse markdown table format: | agentName | role | capabilities | version |
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const parts = trimmed.slice(1, -1).split('|').map(p => p.trim());
      // Skip header row and separator row (starts with --- or has only dashes)
      if (parts.length >= 4 && parts[0] !== 'agentName' && !parts[0].match(/^---+$/)) {
        const agentName = parts[0];
        const role = parts[1];
        const capabilities = parts[2].split(',').map(c => c.trim()).filter(c => c);
        const version = parts[3];

        agents.push({ agentName, role, capabilities, version });
      }
    }
  }

  return { agents };
}

/**
 * Appends agent entries to agents.md file atomically
 * @param {string} filePath - Path to agents.md file
 * @param {Array} entries - Array of agent entries to append
 */
function appendAgents(filePath, entries) {
  // Validate all entries first
  for (const entry of entries) {
    validateAgentEntry(entry);
  }

  // Read existing agents
  const existing = readAgentsMd(filePath);
  const existingNames = new Set(existing.agents.map(a => a.agentName));

  // Filter out duplicates
  const newEntries = entries.filter(e => !existingNames.has(e.agentName));

  if (newEntries.length === 0) {
    return; // Nothing to add
  }

  // Combine existing and new entries
  const allEntries = [...existing.agents, ...newEntries];

  // Write atomically
  writeAgentsMd(filePath, allEntries);
}

/**
 * Writes agents.md file atomically
 * @param {string} filePath - Path to agents.md file
 * @param {Array} agents - Array of agent entries
 */
function writeAgentsMd(filePath, agents) {
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Build markdown table
  let content = '# Agents\n\n';
  content += '| agentName | role | capabilities | version |\n';
  content += '|-----------|------|--------------|---------|\n';

  for (const agent of agents) {
    const capabilities = agent.capabilities.join(', ');
    content += `| ${agent.agentName} | ${agent.role} | ${capabilities} | ${agent.version} |\n`;
  }

  // Write atomically using temp file + rename
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, filePath);
}

/**
 * Creates a backup of agents.md file
 * @param {string} filePath - Path to agents.md file
 */
function backupAgentsMd(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
  }
}

module.exports = {
  readAgentsMd,
  appendAgents,
  writeAgentsMd,
  backupAgentsMd
};