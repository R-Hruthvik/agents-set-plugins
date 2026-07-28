let setIndex = [];

async function bootstrapPlugin(ctx) {
  // Minimal loader: read a compact JSON array of set summaries from ctx.setsPath
  // For now, setIndex remains empty or loaded from a small manifest
  setIndex = [];
}

function getSetChoices() {
  return setIndex.map(s => ({ id: s.setId, name: s.name, agentCount: s.agentCount }));
}

async function triggerAgentsSets() {
  // Tiny startup trigger; in real implementation, this would ping agents-sets service
  return 'ok';
}

module.exports = { bootstrapPlugin, getSetChoices, triggerAgentsSets };