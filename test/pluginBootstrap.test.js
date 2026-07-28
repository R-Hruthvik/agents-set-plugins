const { bootstrapPlugin, getSetChoices, triggerAgentsSets } = require('../src/pluginBootstrap');

test('bootstrapPlugin loads set index and returns summary', async () => {
  const ctx = { setsPath: '/tmp/fake-sets.json' };
  await bootstrapPlugin(ctx);
  const choices = getSetChoices();
  expect(Array.isArray(choices)).toBe(true);
});

test('triggerAgentsSets returns a tiny ack', async () => {
  const ack = await triggerAgentsSets();
  expect(typeof ack).toBe('string');
  expect(ack.length).toBeLessThan(40);
});