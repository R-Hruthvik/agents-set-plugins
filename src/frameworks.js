const fs = require('fs');
const path = require('path');
const os = require('os');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function updateMarkdownRule(filePath, sectionHeader, sectionContent) {
  let existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  const idx = existing.indexOf(sectionHeader);
  if (idx !== -1) {
    const afterSection = existing.slice(idx + sectionHeader.length);
    const nextHeaderMatch = afterSection.match(/\n# /);
    const endIdx = nextHeaderMatch ? idx + sectionHeader.length + nextHeaderMatch.index : existing.length;
    existing = existing.slice(0, idx) + existing.slice(endIdx);
  }
  const updated = existing.trimEnd() ? existing.trimEnd() + '\n\n' + sectionContent : sectionContent;
  fs.writeFileSync(filePath, updated);
}

function installSetsAndPlugins(targetConfig, setObjs, pkgInfo) {
  const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
  ensureDir(setsTargetDir);
  for (const set of setObjs) {
    const src = path.join(pkgInfo.setsDir, `${set.id}.json`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(setsTargetDir, `${set.id}.json`));
    }
  }

  const pluginTarget = path.join(targetConfig.dir, 'plugins');
  if (fs.existsSync(pkgInfo.pluginsDir)) {
    ensureDir(pluginTarget);
    for (const file of fs.readdirSync(pkgInfo.pluginsDir)) {
      fs.copyFileSync(path.join(pkgInfo.pluginsDir, file), path.join(pluginTarget, file));
    }
  }
  return setsTargetDir;
}

const adapters = [
  {
    id: 'opencode',
    name: 'OpenCode',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projDir = path.join(cwd, '.opencode');
      if (fs.existsSync(projDir)) {
        const configPath = path.join(projDir, 'opencode.json');
        return { id: 'opencode', name: 'OpenCode', scope: 'project', dir: projDir, configPath: fs.existsSync(configPath) ? configPath : null };
      }
      const globalDir = path.join(homedir, '.config', 'opencode');
      if (fs.existsSync(globalDir)) {
        const configPath = path.join(globalDir, 'opencode.json');
        return { id: 'opencode', name: 'OpenCode', scope: 'global', dir: globalDir, configPath: fs.existsSync(configPath) ? configPath : null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.opencode');
      const configPath = path.join(dir, 'opencode.json');
      ensureDir(dir);
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ $schema: 'https://opencode.ai/config.json', agent: {} }, null, 2) + '\n');
      }
      return { id: 'opencode', name: 'OpenCode', scope: 'project', dir, configPath };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.config', 'opencode');
      const configPath = path.join(dir, 'opencode.json');
      ensureDir(dir);
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ $schema: 'https://opencode.ai/config.json', agent: {} }, null, 2) + '\n');
      }
      return { id: 'opencode', name: 'OpenCode', scope: 'global', dir, configPath };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      const targetDir = path.join(targetConfig.dir, 'agents');
      ensureDir(targetDir);
      for (const name of allAgentNames) {
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(targetDir, `${name}.md`));
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const agentsMdPath = targetConfig.scope === 'global' ? path.join(os.homedir(), '.config', 'opencode', 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
      const rulesContent = `# Agent Dispatch Rules\n\n## Permission\n- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"\n- Wait for explicit user approval before dispatching\n\n## Available Sets\n- Sets installed in \`${setsTargetDir.replace(/\\/g, '/')}/\`\n- Each set JSON file has: id, name, category, description, agents[], outputPattern\n\n## Dispatch (V1)\n- Find the matching set JSON file by ID in \`${setsTargetDir.replace(/\\/g, '/')}/\`\n- For each agent in the set's agents array, call the \`task\` tool\n- Dispatch read-only agents in parallel; dispatch write agents serially\n\n## Output Format\n- Each result must have: source set, agent name, finding, evidence\n`;
      updateMarkdownRule(agentsMdPath, '# Agent Dispatch Rules', rulesContent);
      return { agentCount: allAgentNames.length, targetDir };
    }
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity / Gemini CLI',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projAgentsDir = path.join(cwd, '.agents');
      const projGeminiDir = path.join(cwd, '.gemini');
      const hasGeminiMd = fs.existsSync(path.join(cwd, 'GEMINI.md')) || fs.existsSync(path.join(cwd, 'AGENTS.md'));
      if (fs.existsSync(projAgentsDir) || fs.existsSync(projGeminiDir) || hasGeminiMd) {
        const dir = fs.existsSync(projAgentsDir) ? projAgentsDir : (fs.existsSync(projGeminiDir) ? projGeminiDir : path.join(cwd, '.agents'));
        return { id: 'antigravity', name: 'Google Antigravity / Gemini CLI', scope: 'project', dir, configPath: null };
      }
      const globalConfig = path.join(homedir, '.gemini', 'config');
      if (fs.existsSync(globalConfig)) {
        return { id: 'antigravity', name: 'Google Antigravity / Gemini CLI', scope: 'global', dir: globalConfig, configPath: null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.agents');
      ensureDir(dir);
      return { id: 'antigravity', name: 'Google Antigravity / Gemini CLI', scope: 'project', dir, configPath: null };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.gemini', 'config');
      ensureDir(dir);
      return { id: 'antigravity', name: 'Google Antigravity / Gemini CLI', scope: 'global', dir, configPath: null };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      const skillsTargetDir = path.join(targetConfig.dir, 'skills');
      ensureDir(skillsTargetDir);
      for (const name of allAgentNames) {
        const agentSkillDir = path.join(skillsTargetDir, name);
        ensureDir(agentSkillDir);
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          const content = fs.readFileSync(src, 'utf-8');
          const skillMd = `---\nname: ${name}\ndescription: ${name} agent skill\n---\n\n${content}`;
          fs.writeFileSync(path.join(agentSkillDir, 'SKILL.md'), skillMd);
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const ruleHeader = '# Agent Dispatch Rules';
      const rulesContent = `# Agent Dispatch Rules\n\n## Permission\n- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"\n- Wait for explicit user approval before dispatching\n\n## Available Agent Sets\n- Sets installed in \`${setsTargetDir.replace(/\\/g, '/')}/\`\n- Installed set IDs: ${selectedSetIds.join(', ')}\n`;
      
      const targetBase = targetConfig.scope === 'global' ? targetConfig.dir : process.cwd();
      updateMarkdownRule(path.join(targetBase, 'AGENTS.md'), ruleHeader, rulesContent);
      updateMarkdownRule(path.join(targetBase, 'GEMINI.md'), ruleHeader, rulesContent);
      return { agentCount: allAgentNames.length, targetDir: skillsTargetDir };
    }
  },
  {
    id: 'claude',
    name: 'Claude Code',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projClaude = path.join(cwd, '.claude');
      const hasClaudeMd = fs.existsSync(path.join(cwd, 'CLAUDE.md'));
      if (fs.existsSync(projClaude) || hasClaudeMd) {
        return { id: 'claude', name: 'Claude Code', scope: 'project', dir: fs.existsSync(projClaude) ? projClaude : path.join(cwd, '.claude'), configPath: null };
      }
      const globalClaude = path.join(homedir, '.claude');
      if (fs.existsSync(globalClaude)) {
        return { id: 'claude', name: 'Claude Code', scope: 'global', dir: globalClaude, configPath: null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.claude');
      ensureDir(dir);
      return { id: 'claude', name: 'Claude Code', scope: 'project', dir, configPath: null };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.claude');
      ensureDir(dir);
      return { id: 'claude', name: 'Claude Code', scope: 'global', dir, configPath: null };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      const agentsTargetDir = path.join(targetConfig.dir, 'agents');
      ensureDir(agentsTargetDir);
      for (const name of allAgentNames) {
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          const body = fs.readFileSync(src, 'utf-8');
          const fileContent = `---\nname: ${name}\ndescription: ${name} specialist subagent for automated code analysis and fixes.\ntools:\n  - Read\n  - Bash\n  - Write\n---\n\n${body}`;
          fs.writeFileSync(path.join(agentsTargetDir, `${name}.md`), fileContent);
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const claudeMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'CLAUDE.md') : path.join(process.cwd(), 'CLAUDE.md');
      const ruleHeader = '# Agent Set Rules';
      const rulesContent = `# Agent Set Rules\n\n## Agent Sets Installed\n- Sets installed in \`${setsTargetDir.replace(/\\/g, '/')}/\`\n- Installed set IDs: ${selectedSetIds.join(', ')}\n\n## Subagents Installed\n${allAgentNames.map(n => `- \`.claude/agents/${n}.md\``).join('\n')}\n\n## Instructions\n- Use subagents in \`.claude/agents/\` for specialized tasks.\n- Always request approval before executing destructive actions.\n`;
      updateMarkdownRule(claudeMdPath, ruleHeader, rulesContent);
      return { agentCount: allAgentNames.length, targetDir: agentsTargetDir };
    }
  },
  {
    id: 'cline',
    name: 'Cline',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projRulesDir = path.join(cwd, '.clinerules');
      if (fs.existsSync(projRulesDir)) {
        return { id: 'cline', name: 'Cline', scope: 'project', dir: projRulesDir, configPath: null };
      }
      const globalRules = path.join(homedir, '.clinerules');
      if (fs.existsSync(globalRules)) {
        return { id: 'cline', name: 'Cline', scope: 'global', dir: globalRules, configPath: null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.clinerules');
      ensureDir(dir);
      return { id: 'cline', name: 'Cline', scope: 'project', dir, configPath: null };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.clinerules');
      ensureDir(dir);
      return { id: 'cline', name: 'Cline', scope: 'global', dir, configPath: null };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      ensureDir(targetConfig.dir);
      for (const name of allAgentNames) {
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(targetConfig.dir, `${name}.md`));
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const summaryFile = path.join(targetConfig.dir, 'agents-summary.md');
      const content = `# Active Agent Rules & Sets\n\n## Sets Installed\n- Location: \`${setsTargetDir.replace(/\\/g, '/')}/\`\n- IDs: ${selectedSetIds.join(', ')}\n\n## Subagents\n${allAgentNames.map(n => `- **${n}**`).join('\n')}\n`;
      fs.writeFileSync(summaryFile, content);
      return { agentCount: allAgentNames.length, targetDir: targetConfig.dir };
    }
  },
  {
    id: 'kilocode',
    name: 'Kilo Code / Kilocode',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projKiloDir = path.join(cwd, '.kilo');
      const projKiloJsonc = path.join(cwd, 'kilo.jsonc');
      if (fs.existsSync(projKiloDir) || fs.existsSync(projKiloJsonc)) {
        const dir = fs.existsSync(projKiloDir) ? projKiloDir : path.join(cwd, '.kilo');
        return { id: 'kilocode', name: 'Kilo Code / Kilocode', scope: 'project', dir, configPath: fs.existsSync(projKiloJsonc) ? projKiloJsonc : null };
      }
      const globalKilo = path.join(homedir, '.config', 'kilo');
      if (fs.existsSync(globalKilo)) {
        return { id: 'kilocode', name: 'Kilo Code / Kilocode', scope: 'global', dir: globalKilo, configPath: null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.kilo');
      const jsoncPath = path.join(cwd, 'kilo.jsonc');
      ensureDir(dir);
      if (!fs.existsSync(jsoncPath)) {
        fs.writeFileSync(jsoncPath, JSON.stringify({
          $schema: 'https://app.kilo.ai/config.json',
          instructions: ['.kilo/rules/*.md'],
          permission: { bash: 'ask', read: 'allow', edit: 'allow' }
        }, null, 2) + '\n');
      }
      return { id: 'kilocode', name: 'Kilo Code / Kilocode', scope: 'project', dir, configPath: jsoncPath };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.config', 'kilo');
      const jsoncPath = path.join(dir, 'kilo.jsonc');
      ensureDir(dir);
      if (!fs.existsSync(jsoncPath)) {
        fs.writeFileSync(jsoncPath, JSON.stringify({
          $schema: 'https://app.kilo.ai/config.json',
          instructions: ['.kilo/rules/*.md'],
          permission: { bash: 'ask', read: 'allow', edit: 'allow' }
        }, null, 2) + '\n');
      }
      return { id: 'kilocode', name: 'Kilo Code / Kilocode', scope: 'global', dir, configPath: jsoncPath };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      const rulesTargetDir = path.join(targetConfig.dir, 'rules');
      ensureDir(rulesTargetDir);
      for (const name of allAgentNames) {
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(rulesTargetDir, `${name}.md`));
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const jsoncPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'kilo.jsonc') : path.join(process.cwd(), 'kilo.jsonc');
      let jsoncData = { $schema: 'https://app.kilo.ai/config.json', instructions: [] };
      if (fs.existsSync(jsoncPath)) {
        try { jsoncData = JSON.parse(fs.readFileSync(jsoncPath, 'utf-8')); } catch {}
      }
      if (!Array.isArray(jsoncData.instructions)) jsoncData.instructions = [];
      const ruleGlob = '.kilo/rules/*.md';
      if (!jsoncData.instructions.includes(ruleGlob)) {
        jsoncData.instructions.push(ruleGlob);
      }
      fs.writeFileSync(jsoncPath, JSON.stringify(jsoncData, null, 2) + '\n');

      const agentsMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
      const ruleHeader = '# Agent Dispatch Rules';
      const rulesContent = `# Agent Dispatch Rules\n\n- Active Kilo Code rules installed in \`.kilo/rules/\`.\n- Agent sets installed in \`${setsTargetDir.replace(/\\/g, '/')}/\`.\n`;
      updateMarkdownRule(agentsMdPath, ruleHeader, rulesContent);

      return { agentCount: allAgentNames.length, targetDir: rulesTargetDir };
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    detect(cwd = process.cwd(), homedir = os.homedir()) {
      const projCursorDir = path.join(cwd, '.cursor');
      const hasCursorRules = fs.existsSync(path.join(cwd, '.cursorrules'));
      if (fs.existsSync(projCursorDir) || hasCursorRules) {
        return { id: 'cursor', name: 'Cursor', scope: 'project', dir: fs.existsSync(projCursorDir) ? projCursorDir : path.join(cwd, '.cursor'), configPath: null };
      }
      const globalCursor = path.join(homedir, '.cursor');
      if (fs.existsSync(globalCursor)) {
        return { id: 'cursor', name: 'Cursor', scope: 'global', dir: globalCursor, configPath: null };
      }
      return null;
    },
    initProject(cwd = process.cwd()) {
      const dir = path.join(cwd, '.cursor', 'rules');
      ensureDir(dir);
      return { id: 'cursor', name: 'Cursor', scope: 'project', dir: path.join(cwd, '.cursor'), configPath: null };
    },
    initGlobal(homedir = os.homedir()) {
      const dir = path.join(homedir, '.cursor', 'rules');
      ensureDir(dir);
      return { id: 'cursor', name: 'Cursor', scope: 'global', dir: path.join(homedir, '.cursor'), configPath: null };
    },
    install(selectedSetIds, setObjs, allAgentNames, pkgInfo, targetConfig) {
      const rulesTargetDir = path.join(targetConfig.dir, 'rules');
      ensureDir(rulesTargetDir);
      for (const name of allAgentNames) {
        const src = path.join(pkgInfo.agentsDir, `${name}.md`);
        if (fs.existsSync(src)) {
          const body = fs.readFileSync(src, 'utf-8');
          const mdcContent = `---\ndescription: ${name} cursor rule\nalwaysApply: false\n---\n\n${body}`;
          fs.writeFileSync(path.join(rulesTargetDir, `${name}.mdc`), mdcContent);
        }
      }
      const setsTargetDir = installSetsAndPlugins(targetConfig, setObjs, pkgInfo);

      const cursorRulesPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, '.cursorrules') : path.join(process.cwd(), '.cursorrules');
      const ruleHeader = '# Agent Set Rules';
      const rulesContent = `# Agent Set Rules\n\nInstalled Cursor rules in \`.cursor/rules/\`.\nInstalled agent sets in \`${setsTargetDir.replace(/\\/g, '/')}/\`.\n`;
      updateMarkdownRule(cursorRulesPath, ruleHeader, rulesContent);

      return { agentCount: allAgentNames.length, targetDir: rulesTargetDir };
    }
  }
];

function getAdapter(id) {
  return adapters.find(a => a.id === id) || null;
}

function getAllAdapters() {
  return adapters;
}

module.exports = { adapters, getAdapter, getAllAdapters };
