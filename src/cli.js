const fs = require('fs');
const path = require('path');
const os = require('os');
const { detectAllFrameworks, detectFrameworkByName } = require('./detector');
const { installAgents, loadAllSets } = require('./installer');
const { getAllAdapters, getAdapter } = require('./frameworks');

let inputQueue = null;

async function prompt(question) {
  return new Promise(resolve => {
    if (process.stdin.isTTY) {
      const { createInterface } = require('readline');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question + ' ', answer => { rl.close(); resolve(answer.trim()); });
    } else {
      if (!inputQueue) {
        inputQueue = [];
        const { createInterface } = require('readline');
        const rl = createInterface({ input: process.stdin });
        rl.on('line', line => inputQueue.push(line.trim()));
        rl.on('close', () => inputQueue.push(null));
      }
      process.stdout.write(question + ' ');
      const wait = () => {
        if (inputQueue.length > 0) {
          const val = inputQueue.shift();
          resolve(val === null ? '' : val);
        } else {
          setTimeout(wait, 50);
        }
      };
      wait();
    }
  });
}

function showCompatibleSummary(sets) {
  console.log('\n============================================================');
  console.log('      Supported AI Agent Frameworks & Compatible Sets       ');
  console.log('============================================================\n');
  console.log('Supported Frameworks:');
  for (const adapter of getAllAdapters()) {
    console.log(`  • ${adapter.name} (${adapter.id})`);
  }
  console.log('\nCompatible Agent Sets Available:');
  for (let i = 0; i < sets.length; i++) {
    console.log(`  ${String(i + 1).padStart(2)}.  ${sets[i].name.padEnd(32)} [${sets[i].category}]`);
  }
  console.log('\nTo install, initialize one of the frameworks above or run:');
  console.log('  npx opencode-agents-installer\n');
}

async function askScopeChoice(frameworkName, frameworkId) {
  const folderName = `.${frameworkId}`;
  const ans = await prompt(`Install ${frameworkName} in Project scope (${folderName}/ in current dir) or Global scope (~/${folderName})? [P/g] (default: P):`);
  const lower = ans.trim().toLowerCase();
  return (lower === 'g' || lower === 'global') ? 'global' : 'project';
}

async function resolveTarget() {
  let detected = detectAllFrameworks();

  if (detected.length === 1) {
    const target = detected[0];
    console.log(`Found framework: ${target.name} (current scope: ${target.scope} at ${target.dir})`);
    const scopeChoice = await askScopeChoice(target.name, target.id);
    const adapter = getAdapter(target.id);
    const resolvedTarget = (scopeChoice === 'global' && adapter.initGlobal) ? adapter.initGlobal() : adapter.initProject();
    return [resolvedTarget];
  }

  if (detected.length > 1) {
    console.log('Multiple AI agent frameworks detected:\n');
    for (let i = 0; i < detected.length; i++) {
      console.log(`  ${i + 1}. ${detected[i].name} (${detected[i].scope}: ${detected[i].dir})`);
    }
    console.log(`  ${detected.length + 1}. All detected frameworks`);
    const choice = await prompt(`\nSelect target framework [1-${detected.length + 1}] (default: 1):`);
    const num = parseInt(choice.trim());
    
    if (num === detected.length + 1) return detected;
    
    const selected = (num >= 1 && num <= detected.length) ? detected[num - 1] : detected[0];
    const scopeChoice = await askScopeChoice(selected.name, selected.id);
    const adapter = getAdapter(selected.id);
    const resolvedTarget = (scopeChoice === 'global' && adapter.initGlobal) ? adapter.initGlobal() : adapter.initProject();
    return [resolvedTarget];
  }

  // Fallback: No framework detected
  console.log('No supported AI agent framework detected automatically.\n');
  const typedName = await prompt('Type an undetected framework to target (e.g. opencode, antigravity, claude, cline, kilocode, cursor) or press Enter to skip:');

  if (typedName) {
    const scopeChoice = await askScopeChoice(typedName, typedName.trim().toLowerCase());
    const manualResult = detectFrameworkByName(typedName, scopeChoice);
    if (manualResult) {
      console.log(`Targeting framework: ${manualResult.name} [${manualResult.scope}] (${manualResult.dir})`);
      return [manualResult];
    } else {
      console.log(`Could not initialize framework target "${typedName}".`);
    }
  }

  const sets = loadAllSets();
  showCompatibleSummary(sets);
  process.exit(0);
}

async function selectSets(sets) {
  console.log();
  for (let i = 0; i < sets.length; i++) {
    console.log(`  ${String(i + 1).padStart(2)}.  ${sets[i].name.padEnd(30)} ${sets[i].category}`);
  }

  const answer = await prompt('\nEnter numbers (comma/range, e.g. 1-5,7,10 or "all"):');
  if (answer.toLowerCase() === 'all') return sets.map(s => s.id);

  const selected = [];
  for (const part of answer.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1]));
      const end = Math.min(sets.length, parseInt(rangeMatch[2]));
      for (let i = start; i <= end; i++) selected.push(sets[i - 1].id);
    } else {
      const num = parseInt(trimmed);
      if (num >= 1 && num <= sets.length) selected.push(sets[num - 1].id);
    }
  }
  return [...new Set(selected)];
}

async function main() {
  console.log('Universal AI Agent Sets Installer\n');

  const targets = await resolveTarget();

  const sets = loadAllSets();
  console.log(`Found ${sets.length} agent sets available.\n`);

  const selectedSets = await selectSets(sets);

  if (selectedSets.length === 0) {
    console.log('No sets selected. Exiting.');
    process.exit(0);
  }

  console.log(`\nSelected sets: ${selectedSets.join(', ')}`);

  const result = installAgents(selectedSets, targets);

  console.log('\n============================================================');
  console.log('Installation Summary:');
  for (const r of result.results) {
    console.log(`  • ${r.frameworkName}: Installed ${r.agentCount} agents into ${r.targetDir}`);
  }
  console.log('============================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
