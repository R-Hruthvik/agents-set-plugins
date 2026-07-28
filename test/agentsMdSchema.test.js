const { validateSetSummary, validateAgentEntry } = require('../src/agentsMdSchema');

test('valid set summary passes', () => {
  const s = { setId: 's1', name: 'Alpha', agentCount: 3, description: 'Desc' };
  expect(() => validateSetSummary(s)).not.toThrow();
});

test('missing setId fails', () => {
  const s = { name: 'Alpha', agentCount: 3, description: 'Desc' };
  expect(() => validateSetSummary(s)).toThrow();
});

test('valid agent entry passes', () => {
  const a = { agentName: 'agent1', role: 'worker', capabilities: ['read'], version: '1.0.0' };
  expect(() => validateAgentEntry(a)).not.toThrow();
});

test('missing agentName fails', () => {
  const a = { role: 'worker', capabilities: ['read'], version: '1.0.0' };
  expect(() => validateAgentEntry(a)).toThrow();
});