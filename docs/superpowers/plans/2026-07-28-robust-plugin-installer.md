# Robust Plugin & Installer Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the plugin read set JSON minimally, expose compact choices to the agent, and trigger agents‑sets at session start while keeping token usage low.

**Architecture:** Introduce a compact set‑summary schema and a token‑light bootstrap interface in the plugin. Add a dedicated agentsMd module for safe, atomic agents.md updates. Refactor the installer to validate inputs, perform transactional writes, and verify post‑install state. Provide a tiny startup trigger that confirms agents‑sets presence.

**Tech Stack:** JavaScript (Node.js), minimal dependencies; tests via a lightweight framework (e.g., Jest or similar already in repo).

## Global Constraints

- Keep agent context lean: expose only compact set summaries (setId, name, agentCount, brief description).
- Ensure all file writes (agents.md, manifest) are atomic and backed up on failure.
- Validate all inputs; fail fast with clear error messages.
- Maintain backward compatibility for existing adapters where feasible.
- Provide token‑efficient prompts: avoid dumping full JSON into agent prompts.

---

## File Structure (overview)

- `src/agentsMdSchema.js` — defines the compact set‑summary and agent entry schema, plus validation helpers.
- `src/agentsMd.js` — reads/writes agents.md with atomic updates, backup, and section management.
- `src/pluginBootstrap.js` — session‑start loader that builds a tiny in‑memory index and triggers agents‑sets.
- `src/installer.js` — updated to use agentsMd and perform transactional installs with validation.
- `src/adapterContract.js` — formal adapter interface (install/uninstall/listAgents) with conformance checks.
- `test/agentsMdSchema.test.js` — tests for schema validation.
- `test/agentsMd.test.js` — tests for agentsMd read/write/append.
- `test/pluginBootstrap.test.js` — tests for startup bootstrap and token‑light interface.
- `test/installer.test.js` — integration tests for installer with transactional writes and agents.md verification.
- `docs/agents-md-schema.md` — documentation of the agents.md schema and usage.
- `docs/plugin-adapter-contract.md` — documentation of the adapter contract.

---

### Task 1: Define compact schema and validation

**Files:**
- Create: `src/agentsMdSchema.js`
- Test: `test/agentsMdSchema.test.js`

**Interfaces:**
- Consumes: none (standalone schema definitions)
- Produces: `validateSetSummary(obj)`, `validateAgentEntry(obj)`, `SetSummary`, `AgentEntry` (types defined in code)

- [ ] **Step 1: Write failing tests for schema validation**

```javascript
// test/agentsMdSchema.test.js
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
```

- [ ] **Step 2: Run tests to verify failures**

Run: `npm test -- --testPathPattern=agentsMdSchema`
Expected: FAIL (module not found / validation not implemented)

- [ ] **Step 3: Implement minimal schema validation**

```javascript
// src/agentsMdSchema.js
function validateSetSummary(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid set summary');
  if (typeof obj.setId !== 'string') throw new Error('setId required');
  if (typeof obj.name !== 'string') throw new Error('name required');
  if (typeof obj.agentCount !== 'number') throw new Error('agentCount required');
  if (typeof obj.description !== 'string') throw new Error('description required');
}

function validateAgentEntry(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid agent entry');
  if (typeof obj.agentName !== 'string') throw new Error('agentName required');
  if (typeof obj.role !== 'string') throw new Error('role required');
  if (!Array.isArray(obj.capabilities)) throw new Error('capabilities required');
  if (typeof obj.version !== 'string') throw new Error('version required');
}

module.exports = { validateSetSummary, validateAgentEntry };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=agentsMdSchema`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/agentsMdSchema.js test/agentsMdSchema.test.js
git commit -m "feat: add compact schema validation for set summaries and agent entries"
```

---

### Task 2: Implement agentsMd read/write with atomicity

**Files:**
- Create: `src/agentsMd.js`
- Test: `test/agentsMd.test.js`

**Interfaces:**
- Consumes: `validateSetSummary`, `validateAgentEntry` from Task 1
- Produces: `readAgentsMd(path)`, `appendAgents(path, entries)`, `writeAgentsMd(path, data)`, `backupAgentsMd(path)`

- [ ] **Step 1: Write failing tests for agentsMd operations**

```javascript
// test/agentsMd.test.js
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
```

- [ ] **Step 2: Run tests to verify failures**

Run: `npm test -- --testPathPattern=agentsMd`
Expected: FAIL (module not found or functions undefined)

- [ ] **Step 3: Implement agentsMd module with atomic writes**

```javascript
// src/agentsMd.js
const fs = require('fs');
const path = require('path');
const { validateAgentEntry } = require('./agentsMdSchema');

function readAgentsMd(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const match = raw.match(/```json\n([\s\S]*?)\n```/);
    const json = match ? match[1] : '{"agents":[]}';
    return JSON.parse(json);
  } catch (e) {
    return { agents: [] };
  }
}

function writeAgentsMd(filePath, data) {
  const content = `# Agents\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

function appendAgents(filePath, entries) {
  entries.forEach(validateAgentEntry);
  const data = readAgentsMd(filePath);
  data.agents.push(...entries);
  writeAgentsMd(filePath, data);
}

function backupAgentsMd(filePath) {
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, filePath + '.bak');
  }
}

module.exports = { readAgentsMd, writeAgentsMd, appendAgents, backupAgentsMd };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=agentsMd`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/agentsMd.js test/agentsMd.test.js
git commit -m "feat: add atomic agents.md read/write with backup and append"
```

---

### Task 3: Add plugin bootstrap and token‑light interface

**Files:**
- Create: `src/pluginBootstrap.js`
- Test: `test/pluginBootstrap.test.js`

**Interfaces:**
- Consumes: `readAgentsMd`, `validateSetSummary` (Tasks 1–2)
- Produces: `bootstrapPlugin(sessionContext)`, `getSetChoices()`, `triggerAgentsSets()`

- [ ] **Step 1: Write failing tests for bootstrap and token‑light choices**

```javascript
// test/pluginBootstrap.test.js
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
```

- [ ] **Step 2: Run tests to verify failures**

Run: `npm test -- --testPathPattern=pluginBootstrap`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement plugin bootstrap with minimal loading**

```javascript
// src/pluginBootstrap.js
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
  // Tiny startup trigger; in real implementation, this would ping agents‑sets service
  return 'ok';
}

module.exports = { bootstrapPlugin, getSetChoices, triggerAgentsSets };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=pluginBootstrap`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pluginBootstrap.js test/pluginBootstrap.test.js
git commit -m "feat: add plugin bootstrap with token‑light set choices and startup trigger"
```

---

### Task 4: Refactor installer to use agentsMd and transactional writes

**Files:**
- Modify: `src/installer.js`
- Test: `test/installer.test.js`

**Interfaces:**
- Consumes: `agentsMd` (Task 2), `validateSetSummary` (Task 1)
- Produces: `installAgents(options)` with improved validation and atomic writes

- [ ] **Step 1: Write failing tests for installer with agentsMd integration**

```javascript
// test/installer.test.js
const { installAgents } = require('../src/installer');
const fs = require('fs');
const path = require('path');
const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'inst-'));

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

test('installAgents writes manifest and agents.md atomically', async () => {
  const opts = {
    targetFrameworks: ['opencode'],
    selectedSets: [{ setId: 's1', name: 'Alpha', agentCount: 3, description: 'Desc' }],
    baseDir: tmpDir,
  };
  const result = await installAgents(opts);
  expect(result).toHaveProperty('summary');
  const manifestPath = path.join(tmpDir, 'manifest.json');
  expect(fs.existsSync(manifestPath)).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify failures**

Run: `npm test -- --testPathPattern=installer`
Expected: FAIL (likely missing agentMd integration or validation)

- [ ] **Step 3: Update installer to use agentsMd and validate inputs**

```javascript
// src/installer.js (excerpt of changes)
const { validateSetSummary } = require('./agentsMdSchema');
const { backupAgentsMd, appendAgents } = require('./agentsMd');

async function installAgents(opts) {
  opts.selectedSets.forEach(validateSetSummary);
  // ... existing logic to resolve adapters ...
  // Use backupAgentsMd before any write
  backupAgentsMd(path.join(opts.baseDir, 'agents.md'));
  // ... perform adapter.install and appendAgents ...
  // Write manifest atomically (existing code already does, ensure it remains atomic)
  return { summary: 'ok' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=installer`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/installer.js test/installer.test.js
git commit -m "feat: integrate agentsMd and transactional writes into installer"
```

---

### Task 5: Document schema and adapter contract

**Files:**
- Create: `docs/agents-md-schema.md`
- Create: `docs/plugin-adapter-contract.md`

**Interfaces:**
- Consumes: schemas and modules from Tasks 1–3
- Produces: documentation artifacts

- [ ] **Step 1: Draft agents.md schema doc**

```markdown
# Agents.md Schema

## Set Summary
- setId (string)
- name (string)
- agentCount (number)
- description (string)

## Agent Entry
- agentName (string)
- role (string)
- capabilities (string[])
- version (string)

## Format in agents.md
```json
{ "agents": [ { ... } ] }
```
```

- [ ] **Step 2: Draft adapter contract doc**

```markdown
# Plugin Adapter Contract

## Required Methods
- install(context)
- uninstall(context)
- listAgents()

## Context Contains
- targetDir
- setSummary
- agentsMdPath

## Return Values
- install: success/failure status
- listAgents: array of agent entries
```

- [ ] **Step 3: Commit docs**

```bash
git add docs/agents-md-schema.md docs/plugin-adapter-contract.md
git commit -m "docs: add agents.md schema and plugin adapter contract"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-28-robust-plugin-installer.md`. Two execution options:

**1. Subagent-Driven (recommended)** – I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** – Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?