const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { describe, it, before, after } = require('node:test');
const { detectAllFrameworks, detectFrameworkByName } = require('../src/detector');
const { installAgents, loadAllSets, uninstallAgents } = require('../src/installer');
const { adapters } = require('../src/frameworks');

describe('Framework & Multi-Target Installer Tests', () => {
  let originalCwd;
  let testDir;

  before(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-'));
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  after(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('Empty directory returns zero detected frameworks', () => {
    const emptyDetect = detectAllFrameworks(testDir, testDir);
    assert.strictEqual(emptyDetect.length, 0, 'Empty directory should return 0 detected frameworks');
  });

  it('Manual framework lookup & initialization works for Claude Code', () => {
    const claudeManual = detectFrameworkByName('claude', 'project', testDir, testDir);
    assert.ok(claudeManual, 'Manual lookup for claude should return initialized target');
    assert.strictEqual(claudeManual.id, 'claude');
    assert.ok(fs.existsSync(path.join(testDir, '.claude')), '.claude directory should be created');
  });

  it('Multiple framework initialization & multi-detection', () => {
    const kilocodeManual = detectFrameworkByName('kilocode', 'project', testDir, testDir);
    const antigravityManual = detectFrameworkByName('antigravity', 'project', testDir, testDir);
    assert.ok(kilocodeManual);
    assert.ok(antigravityManual);

    const multiDetect = detectAllFrameworks(testDir, testDir);
    assert.ok(multiDetect.length >= 3, 'Multi-detection should find at least 3 initialized frameworks');
  });

  it('Install agents into multi-target frameworks', () => {
    const sets = loadAllSets();
    assert.ok(sets.length > 0, 'Should load available sets');
    const selectedSets = [sets[0].id];

    const multiDetect = detectAllFrameworks(testDir, testDir);
    const result = installAgents(selectedSets, multiDetect);
    assert.ok(result.results.length >= 3, 'Installation results should cover all target frameworks');
  });

  it('Verify framework-specific file outputs', () => {
    assert.ok(fs.existsSync(path.join(testDir, '.claude', 'agents')), '.claude/agents should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'CLAUDE.md')), 'CLAUDE.md should exist');
    assert.ok(fs.existsSync(path.join(testDir, '.kilo', 'rules')), '.kilo/rules should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'kilo.jsonc')), 'kilo.jsonc should exist');
    assert.ok(fs.existsSync(path.join(testDir, '.agents', 'skills')), '.agents/skills should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'GEMINI.md')), 'GEMINI.md should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');
  });
});
