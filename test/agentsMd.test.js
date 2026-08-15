const fs = require('fs');
const path = require('path');
const { test, before, after, describe, it } = require('node:test');
const assert = require('node:assert');
const { readAgentsMd, appendAgents, writeAgentsMd, backupAgentsMd } = require('../src/agentsMd');

const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'amd-'));
const testFile = path.join(tmpDir, 'agents.md');

after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

describe('agentsMd', () => {
  it('readAgentsMd returns empty structure on missing file', () => {
    const data = readAgentsMd(testFile);
    assert.ok(data.agents);
    assert.ok(Array.isArray(data.agents));
    assert.strictEqual(data.agents.length, 0);
  });

  it('appendAgents adds entries and writeAgentsMd persists', () => {
    const entry = { agentName: 'a1', role: 'r', capabilities: ['c'], version: '1' };
    appendAgents(testFile, [entry]);
    const data = readAgentsMd(testFile);
    assert.strictEqual(data.agents.length, 1);
    assert.strictEqual(data.agents[0].agentName, 'a1');
  });

  it('backupAgentsMd creates a backup file', () => {
    backupAgentsMd(testFile);
    const backupExists = fs.existsSync(testFile + '.bak');
    assert.strictEqual(backupExists, true);
  });
});
