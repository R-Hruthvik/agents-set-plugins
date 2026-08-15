const { bootstrapPlugin, getSetChoices, triggerAgentsSets } = require('../src/pluginBootstrap');
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('pluginBootstrap', () => {
  it('bootstrapPlugin loads set index and returns summary', async () => {
    const ctx = { setsPath: '/tmp/fake-sets.json' };
    await bootstrapPlugin(ctx);
    const choices = getSetChoices();
    assert.ok(Array.isArray(choices));
  });

  it('triggerAgentsSets returns a tiny ack', async () => {
    const ack = await triggerAgentsSets();
    assert.strictEqual(typeof ack, 'string');
    assert.ok(ack.length < 40);
  });
});
