const fs = require('fs');
const path = require('path');
const { getAdapter } = require('./frameworks');

const PACKAGE_AGENTS_DIR = path.join(__dirname, '..', 'agents');
const PACKAGE_SETS_DIR = path.join(__dirname, '..', 'sets');
const PACKAGE_PLUGINS_DIR = path.join(__dirname, '..', 'plugins');

function getManifestPath(dir) {
  return path.join(dir, '.agents-set-manifest.json');
}

function readManifest(dir) {
  const mp = getManifestPath(dir);
  if (fs.existsSync(mp)) {
    try { return JSON.parse(fs.readFileSync(mp, 'utf-8')); } catch {}
  }
  return { agentFiles: [], sets: [] };
}

function writeManifest(dir, agentNames, setIds) {
  const mp = getManifestPath(dir);
  const manifest = {
    version: 2,
    installedAt: new Date().toISOString(),
    agentFiles: agentNames.map(n => `${n}.md`),
    sets: setIds,
  };
  fs.writeFileSync(mp, JSON.stringify(manifest, null, 2) + '\n');
}

function getSelectedAgentNames(sets, selectedSetIds) {
  const names = new Set();
  for (const set of sets) {
    if (selectedSetIds.includes(set.id)) {
      for (const agent of set.agents) {
        names.add(agent.file.replace('.md', ''));
      }
    }
  }
  return [...names];
}

function loadAllSets() {
  const files = fs.readdirSync(PACKAGE_SETS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(PACKAGE_SETS_DIR, f), 'utf-8'));
    return { ...data, id: f.replace('.json', '') };
  });
}

function installAgents(selectedSets, targetFrameworksInput) {
  const sets = loadAllSets();
  const selectedSetObjs = sets.filter(s => selectedSets.includes(s.id));
  const newAgentNames = getSelectedAgentNames(sets, selectedSets);

  const targetFrameworks = Array.isArray(targetFrameworksInput) ? targetFrameworksInput : [targetFrameworksInput];
  const pkgInfo = {
    agentsDir: PACKAGE_AGENTS_DIR,
    setsDir: PACKAGE_SETS_DIR,
    pluginsDir: PACKAGE_PLUGINS_DIR,
  };

  const results = [];
  let primaryTargetDir = '';

  for (const targetConfig of targetFrameworks) {
    const adapter = getAdapter(targetConfig.id);
    if (!adapter) continue;

    const prevManifest = readManifest(targetConfig.dir);
    const allAgentNames = [...new Set([...prevManifest.agentFiles.map(f => f.replace('.md', '')), ...newAgentNames])];
    const allSetIds = [...new Set([...prevManifest.sets, ...selectedSets])];

    const res = adapter.install(allSetIds, selectedSetObjs, allAgentNames, pkgInfo, targetConfig);
    writeManifest(targetConfig.dir, allAgentNames, allSetIds);

    results.push({ frameworkId: targetConfig.id, frameworkName: adapter.name, targetDir: res.targetDir, agentCount: res.agentCount });
    if (!primaryTargetDir) primaryTargetDir = res.targetDir;
  }

  return {
    agentCount: newAgentNames.length,
    setCount: selectedSetObjs.length,
    targetDir: primaryTargetDir,
    results,
    sets: selectedSetObjs,
  };
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
