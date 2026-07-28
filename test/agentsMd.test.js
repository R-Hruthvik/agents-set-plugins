const fs = require('fs');
const path = require('path');
const { readAgentsMd, appendAgents, writeAgentsMd, backupAgentsMd } = require('../src/agentsMd');

const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'amd-'));
const testFile = path.join(tmpDir, 'agents.md');

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

test('readAgentsMd returns empty structure on missing file', () => {
  const data = readAgentsMd(testFile);
  expect(data).toHaveProperty('agents');
  expect(Array.isArray(data.agents)).toBe(true);
});

test('appendAgents adds entries and writeAgentsMd persists', () => {
  const entry = { agentName: 'a1', role: 'r', capabilities: ['c'], version: '1' };
  appendAgents(testFile, [entry]);
  const data = readAgentsMd(testFile);
  expect(data.agents.length).toBe(1);
  expect(data.agents[0].agentName).toBe('a1');
});

test('backupAgentsMd creates a backup file', () => {
  backupAgentsMd(testFile);
  const backupExists = fs.existsSync(testFile + '.bak');
  expect(backupExists).toBe(true);
});