const fs = require('fs');
const path = require('path');
const { getTargetDir } = require('./detector');

const PACKAGE_AGENTS_DIR = path.join(__dirname, '..', 'agents');
const PACKAGE_SETS_DIR = path.join(__dirname, '..', 'sets');
const PACKAGE_PLUGINS_DIR = path.join(__dirname, '..', 'plugins');

function getManifestPath(opencodeDir) {
  return path.join(opencodeDir, '.opencode-agents-manifest.json');
}

function readManifest(opencodeDir) {
  const mp = getManifestPath(opencodeDir);
  if (fs.existsSync(mp)) {
    try { return JSON.parse(fs.readFileSync(mp, 'utf-8')); } catch {}
  }
  return { agentFiles: [], sets: [] };
}

function writeManifest(opencodeDir, agentNames, setIds) {
  const mp = getManifestPath(opencodeDir);
  const manifest = {
    version: 1,
    installedAt: new Date().toISOString(),
    agentFiles: agentNames.map(n => `${n}.md`),
    sets: setIds,
  };
  fs.writeFileSync(mp, JSON.stringify(manifest, null, 2) + '\n');
}

function getAgentsSetsDir(opencodeDir) {
  return path.join(opencodeDir, 'agents-sets');
}

function getAgentsMdContent(opencodeDir) {
  const setsDir = getAgentsSetsDir(opencodeDir).replace(/\\/g, '/');
  return `# Agent Dispatch Rules

## Permission
- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"
- Wait for explicit user approval before dispatching

## Available Sets
- Sets installed in \`${setsDir}/\`
- Each set JSON file has: id, name, category, description, agents[], outputPattern

## Dispatch (V1)
- Find the matching set JSON file by ID in \`${setsDir}/\`
- For each agent in the set's agents array, call the \`task\` tool with:
  - description: agent.name
  - subagent_type: agent.file.replace('.md', '')
  - prompt: the task + agent-specific instructions
- Dispatch read-only agents (audit/research/review sets) in parallel
- Dispatch write agents (fix/modify sets) **serially** — two agents editing the same file will conflict
- If a set has both read-only and write agents, dispatch write agents serially after read agents finish
- After all agents complete, call the plugin's \`get_results\` tool

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
`;
}

function getSelectedAgentNames(sets, selectedSetNames) {
  const names = new Set();
  for (const set of sets) {
    if (selectedSetNames.includes(set.id)) {
      for (const agent of set.agents) {
        names.add(agent.file.replace('.md', ''));
      }
    }
  }
  return [...names];
}

function ensureAgentsMd(opencodeDir) {
  const targetPath = path.join(process.cwd(), 'AGENTS.md');
  const ourContent = getAgentsMdContent(opencodeDir);
  const ourSectionStart = '# Agent Dispatch Rules';

  if (fs.existsSync(targetPath)) {
    let existing = fs.readFileSync(targetPath, 'utf-8');
    const idx = existing.indexOf(ourSectionStart);
    if (idx !== -1) {
      const afterSection = existing.slice(idx + ourSectionStart.length);
      const nextMatch = afterSection.match(/\n# /);
      const endIdx = nextMatch ? idx + ourSectionStart.length + nextMatch.index : existing.length;
      existing = existing.slice(0, idx) + existing.slice(endIdx);
    }
    existing = existing.trimEnd() + '\n\n' + ourContent;
    fs.writeFileSync(targetPath, existing);
  } else {
    fs.writeFileSync(targetPath, ourContent);
  }
}

function installAgents(selectedSets, opencode) {
  const sets = loadAllSets();
  const selectedSetObjs = sets.filter(s => selectedSets.includes(s.id));
  const newAgentNames = getSelectedAgentNames(sets, selectedSets);
  const targetDir = getTargetDir(opencode);

  // Merge with previous install (additive — never remove)
  const prevManifest = readManifest(opencode.dir);
  const allAgentNames = [...new Set([...prevManifest.agentFiles.map(f => f.replace('.md', '')), ...newAgentNames])];
  const allSetIds = [...new Set([...prevManifest.sets, ...selectedSets])];

  // Ensure agent directory exists and copy files
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  for (const name of allAgentNames) {
    const src = path.join(PACKAGE_AGENTS_DIR, `${name}.md`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, `${name}.md`));
    }
  }

  // Copy selected set JSON files to agents-sets/ (additive)
  const setsTargetDir = getAgentsSetsDir(opencode.dir);
  if (!fs.existsSync(setsTargetDir)) fs.mkdirSync(setsTargetDir, { recursive: true });
  for (const set of selectedSetObjs) {
    const src = path.join(PACKAGE_SETS_DIR, `${set.id}.json`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(setsTargetDir, `${set.id}.json`));
    }
  }

  // Copy plugin files (overwrite)
  const pluginTarget = path.join(opencode.dir, 'plugins');
  if (fs.existsSync(PACKAGE_PLUGINS_DIR)) {
    if (!fs.existsSync(pluginTarget)) fs.mkdirSync(pluginTarget, { recursive: true });
    for (const file of fs.readdirSync(PACKAGE_PLUGINS_DIR)) {
      fs.copyFileSync(path.join(PACKAGE_PLUGINS_DIR, file), path.join(pluginTarget, file));
    }
  }

  // Write updated manifest (merged)
  writeManifest(opencode.dir, allAgentNames, allSetIds);

  // Update AGENTS.md
  ensureAgentsMd(opencode.dir);

  return {
    agentCount: allAgentNames.length,
    setCount: allSetIds.length,
    targetDir,
    sets: selectedSetObjs,
  };
}

function loadAllSets() {
  const files = fs.readdirSync(PACKAGE_SETS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(PACKAGE_SETS_DIR, f), 'utf-8'));
    return { ...data, id: f.replace('.json', '') };
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }
  return fm;
}

module.exports = { installAgents, loadAllSets, parseFrontmatter };
