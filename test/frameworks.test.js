const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { detectAllFrameworks, detectFrameworkByName } = require('../src/detector');
const { installAgents, loadAllSets } = require('../src/installer');
const { adapters } = require('../src/frameworks');

function runTests() {
  console.log('Running Framework & Multi-Target Installer Tests...\n');

  const testDir = path.join(__dirname, 'tmp_test_env');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const originalCwd = process.cwd();
  process.chdir(testDir);

  try {
    // Test 1: Empty directory returns zero frameworks
    const emptyDetect = detectAllFrameworks(testDir, testDir);
    assert.strictEqual(emptyDetect.length, 0, 'Empty directory should return 0 detected frameworks');
    console.log('✓ Test 1 Passed: Empty directory returns zero detected frameworks.');

    // Test 2: Manual framework lookup & initialization
    const claudeManual = detectFrameworkByName('claude', 'project', testDir, testDir);
    assert.ok(claudeManual, 'Manual lookup for claude should return initialized target');
    assert.strictEqual(claudeManual.id, 'claude');
    assert.ok(fs.existsSync(path.join(testDir, '.claude')), '.claude directory should be created');
    console.log('✓ Test 2 Passed: Manual framework initialization (Claude Code).');

    // Test 3: Initialize multiple frameworks & test multi-detection
    const kilocodeManual = detectFrameworkByName('kilocode', 'project', testDir, testDir);
    const antigravityManual = detectFrameworkByName('antigravity', 'project', testDir, testDir);
    assert.ok(kilocodeManual);
    assert.ok(antigravityManual);

    const multiDetect = detectAllFrameworks(testDir, testDir);
    assert.ok(multiDetect.length >= 3, 'Multi-detection should find at least 3 initialized frameworks');
    console.log(`✓ Test 3 Passed: Multi-detection found ${multiDetect.length} active frameworks.`);

    // Test 4: Install agents into multi-target frameworks
    const sets = loadAllSets();
    assert.ok(sets.length > 0, 'Should load available sets');
    const selectedSets = [sets[0].id];

    const result = installAgents(selectedSets, multiDetect);
    assert.ok(result.results.length >= 3, 'Installation results should cover all target frameworks');
    console.log('✓ Test 4 Passed: Agents installed across multiple target frameworks.');

    // Test 5: Verify framework-specific file outputs
    // Claude output check
    assert.ok(fs.existsSync(path.join(testDir, '.claude', 'agents')), '.claude/agents should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'CLAUDE.md')), 'CLAUDE.md should exist');

    // Kilo Code output check
    assert.ok(fs.existsSync(path.join(testDir, '.kilo', 'rules')), '.kilo/rules should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'kilo.jsonc')), 'kilo.jsonc should exist');

    // Antigravity output check
    assert.ok(fs.existsSync(path.join(testDir, '.agents', 'skills')), '.agents/skills should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'GEMINI.md')), 'GEMINI.md should exist');
    assert.ok(fs.existsSync(path.join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');

    console.log('✓ Test 5 Passed: Verified framework-specific agent files, rules, and manifests.');

  } finally {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }

  console.log('\nAll tests passed successfully!');
}

runTests();
