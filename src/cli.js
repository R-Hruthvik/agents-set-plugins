const fs = require('fs');
const path = require('path');
const os = require('os');
const { detectAllFrameworks, detectFrameworkByName } = require('./detector');
const { installAgents, uninstallAgents, readManifest, loadAllSets } = require('./installer');
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
  console.log('  npx @hruthvik-r/agents-sets\n');
}

const frameworkDisplayPaths = {
  opencode: { project: '.opencode/', global: '~/.config/opencode' },
  antigravity: { project: '.agents/', global: '~/.gemini/config' },
  claude: { project: '.claude/', global: '~/.claude' },
  cline: { project: '.clinerules/', global: '~/.clinerules' },
  kilocode: { project: '.kilo/', global: '~/.config/kilo' },
  cursor: { project: '.cursor/', global: '~/.cursor' },
};

async function askScopeChoice(frameworkName, frameworkId, actionVerb = 'Target') {
  const paths = frameworkDisplayPaths[frameworkId] || { project: `.${frameworkId}/`, global: `~/.${frameworkId}` };
  const ans = await prompt(`${actionVerb} ${frameworkName} in Project scope (${paths.project} in current dir) or Global scope (${paths.global})? [P/g] (default: P):`);
  const lower = ans.trim().toLowerCase();
  return (lower === 'g' || lower === 'global') ? 'global' : 'project';
}

async function resolveTarget(isUninstall = false) {
  let detected = detectAllFrameworks();
  const verb = isUninstall ? 'Target' : 'Install';

  if (detected.length === 1) {
    const target = detected[0];
    console.log(`Found framework: ${target.name} (current scope: ${target.scope} at ${target.dir})`);
    const scopeChoice = await askScopeChoice(target.name, target.id, verb);
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
    
    if (num === detected.length + 1) {
      const resolvedList = [];
      for (const target of detected) {
        console.log(`\nConfiguring target for ${target.name}:`);
        const scopeChoice = await askScopeChoice(target.name, target.id, verb);
        const adapter = getAdapter(target.id);
        const resolved = (scopeChoice === 'global' && adapter.initGlobal) ? adapter.initGlobal() : adapter.initProject();
        resolvedList.push(resolved);
      }
      return resolvedList;
    }
    
    const selected = (num >= 1 && num <= detected.length) ? detected[num - 1] : detected[0];
    const scopeChoice = await askScopeChoice(selected.name, selected.id, verb);
    const adapter = getAdapter(selected.id);
    const resolvedTarget = (scopeChoice === 'global' && adapter.initGlobal) ? adapter.initGlobal() : adapter.initProject();
    return [resolvedTarget];
  }

  // Fallback: No framework detected
  console.log('No supported AI agent framework detected automatically.\n');
  const typedName = await prompt('Type an undetected framework to target (e.g. opencode, antigravity, claude, cline, kilocode, cursor) or press Enter to skip:');

  if (typedName) {
    const scopeChoice = await askScopeChoice(typedName, typedName.trim().toLowerCase(), verb);
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

async function selectSets(sets, label = 'available') {
  console.log();
  for (let i = 0; i < sets.length; i++) {
    console.log(`  ${String(i + 1).padStart(2)}.  ${sets[i].name.padEnd(30)} ${sets[i].category}`);
  }

  const answer = await prompt(`\nEnter numbers (comma/range, e.g. 1-5,7,10 or "all" to select all ${label}):`);
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

function detectInstalledSetIds(targets) {
  const installedSetIds = new Set();
  for (const target of targets) {
    const manifest = readManifest(target.dir);
    for (const s of manifest.sets) {
      installedSetIds.add(s);
    }
    const setsDir = path.join(target.dir, 'agents-sets');
    if (fs.existsSync(setsDir)) {
      for (const file of fs.readdirSync(setsDir)) {
        if (file.endsWith('.json')) {
          installedSetIds.add(file.replace('.json', ''));
        }
      }
    }
  }
  return [...installedSetIds];
}

async function handleUninstall(targets) {
  const allSets = loadAllSets();
  const installedSetIds = detectInstalledSetIds(targets);

  if (installedSetIds.length === 0) {
    console.log('\nNo agent sets are currently installed in the selected target framework(s).');
    process.exit(0);
  }

  const installedSetObjs = allSets.filter(s => installedSetIds.includes(s.id));

  console.log('\nUninstall Options:');
  console.log(`  1. Remove a specific installed agent set (${installedSetObjs.length} set(s) currently installed)`);
  console.log('  2. Remove ALL agent sets and agents (Clean Uninstall)');
  
  const choice = await prompt('\nSelect action [1-2] (default: 1):');
  const num = parseInt(choice.trim());

  if (num === 2) {
    const confirm = await prompt('Are you sure you want to remove ALL installed agent sets and agent files? [y/N]:');
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      const result = uninstallAgents([], targets, true);
      console.log('\n============================================================');
      console.log('Uninstallation Summary:');
      for (const r of result.results) {
        console.log(`  ✔ ${r.frameworkName}: Uninstalled successfully (all agent sets and subagents removed).`);
      }
      console.log('============================================================\n');
    } else {
      console.log('Uninstallation cancelled.');
    }
    process.exit(0);
  }

  // Remove specific installed agent set — present ONLY installed sets to user
  console.log(`\nCurrently Installed Agent Sets (${installedSetObjs.length}):`);
  const selectedSetIds = await selectSets(installedSetObjs, 'installed');

  if (selectedSetIds.length === 0) {
    console.log('No installed set selected to remove.');
    process.exit(0);
  }

  const result = uninstallAgents(selectedSetIds, targets, false);
  console.log('\n============================================================');
  console.log('Uninstallation Summary:');
  for (const r of result.results) {
    console.log(`  ✔ ${r.frameworkName}: Uninstalled ${selectedSetIds.length} agent set(s) (${r.removedAgentsCount || 0} subagents) successfully.`);
  }
  console.log('============================================================\n');
  process.exit(0);
}

async function main() {
  console.log('Universal AI Agent Sets System (@hruthvik-r/agents-sets)\n');

  console.log('Action Menu:');
  console.log('  1. Install / Update Agent Sets');
  console.log('  2. Uninstall Agent Sets / Clean Remove');

  const actionChoice = await prompt('\nSelect action [1-2] (default: 1):');
  const isUninstall = parseInt(actionChoice.trim()) === 2;

  const targets = await resolveTarget(isUninstall);

  if (isUninstall) {
    await handleUninstall(targets);
    return;
  }

  const sets = loadAllSets();
  console.log(`Found ${sets.length} agent sets available.\n`);

  const selectedSets = await selectSets(sets, 'available');

  if (selectedSets.length === 0) {
    console.log('No sets selected. Exiting.');
    process.exit(0);
  }

  console.log(`\nSelected ${selectedSets.length} agent set(s).`);

  const result = installAgents(selectedSets, targets);

  console.log('\n============================================================');
  console.log('Installation Summary:');
  for (const r of result.results) {
    console.log(`  ✔ ${r.frameworkName}: Installed ${selectedSets.length} agent set(s) (${r.agentCount} subagents) successfully into ${r.targetDir}`);
  }
  console.log('============================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
