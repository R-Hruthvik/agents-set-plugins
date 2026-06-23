const fs = require('fs');
const path = require('path');
const os = require('os');
const { detectOpenCode, createProjectConfig } = require('./detector');
const { installAgents, loadAllSets } = require('./installer');

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

function hasGlobalConfig() {
  return fs.existsSync(path.join(os.homedir(), '.config', 'opencode'));
}

function hasProjectDir() {
  return fs.existsSync(path.join(process.cwd(), '.opencode'));
}

async function resolveTarget() {
  if (hasProjectDir()) {
    const oc = detectOpenCode();
    console.log(`Found project config: ${oc.dir}`);
    return oc;
  }

  if (hasGlobalConfig()) {
    const answer = await prompt(
      'Install project-scoped (create .opencode/ here) or globally? [P/g]:'
    );
    if (answer.toLowerCase() === 'g' || answer.toLowerCase() === 'global') {
      const oc = detectOpenCode();
      console.log(`Installing globally: ${oc.dir}`);
      return oc;
    }
    const oc = createProjectConfig();
    console.log(`Created .opencode/ in ${process.cwd()}`);
    return oc;
  }

  const answer = await prompt(
    'No OpenCode config found. Create .opencode/ in current directory? (Y/n):'
  );
  if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
    console.log('Installation cancelled.');
    process.exit(0);
  }
  const oc = createProjectConfig();
  console.log(`Created .opencode/ in ${process.cwd()}`);
  return oc;
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
  console.log('OpenCode Agents Installer\n');

  const opencode = await resolveTarget();

  const sets = loadAllSets();
  console.log(`Found ${sets.length} agent sets available.\n`);

  const selectedSets = await selectSets(sets);

  if (selectedSets.length === 0) {
    console.log('No sets selected. Exiting.');
    process.exit(0);
  }

  console.log(`\nSelected sets: ${selectedSets.join(', ')}`);

  const result = installAgents(selectedSets, opencode);

  console.log(`\nInstalled ${result.agentCount} agents to ${result.targetDir}`);
  console.log(`Installed plugin for agent lifecycle tracking.`);
  console.log('\nRestart OpenCode for changes to take effect.');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
