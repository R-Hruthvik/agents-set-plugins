const { validateSetSummary, validateAgentEntry } = require('../src/agentsMdSchema');
const { test, describe, it } = require('node:test');
const assert = require('node:assert');

describe('agentsMdSchema', () => {
  it('valid set summary passes', () => {
    const s = { setId: 's1', name: 'Alpha', agentCount: 3, description: 'Desc' };
    assert.doesNotThrow(() => validateSetSummary(s));
  });

  it('missing setId fails', () => {
    const s = { name: 'Alpha', agentCount: 3, description: 'Desc' };
    assert.throws(() => validateSetSummary(s));
  });

  it('valid agent entry passes', () => {
    const a = { agentName: 'agent1', role: 'worker', capabilities: ['read'], version: '1.0.0' };
    assert.doesNotThrow(() => validateAgentEntry(a));
  });

  it('missing agentName fails', () => {
    const a = { role: 'worker', capabilities: ['read'], version: '1.0.0' };
    assert.throws(() => validateAgentEntry(a));
  });
});
