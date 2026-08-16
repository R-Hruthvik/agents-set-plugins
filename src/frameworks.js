const fs = require('fs');
const path = require('path');
const os = require('os');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function removeMarkdownRuleSection(filePath, headersToRemove) {
  if (!fs.existsSync(filePath)) return;
  const headers = Array.isArray(headersToRemove) ? headersToRemove : [headersToRemove];
  let existing = fs.readFileSync(filePath, 'utf-8');

  for (const sectionHeader of headers) {
    let idx = existing.indexOf(sectionHeader);
    while (idx !== -1) {
      const afterSection = existing.slice(idx + sectionHeader.length);
      const nextHeaderMatch = afterSection.match(/\n# /);
      const endIdx = nextHeaderMatch ? idx + sectionHeader.length + nextHeaderMatch.index : existing.length;
      existing = existing.slice(0, idx) + existing.slice(endIdx);
      idx = existing.indexOf(sectionHeader);
    }
  }

  const cleaned = existing.trimEnd();
  if (cleaned.length === 0) {
    fs.unlinkSync(filePath);
  } else {
    fs.writeFileSync(filePath, cleaned + '\n');
  }
}

function updateMarkdownRule(filePath, headersToRemove, primaryHeader, sectionContent) {
  ensureDir(path.dirname(filePath));
  let existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

  const headers = Array.isArray(headersToRemove) ? headersToRemove : [headersToRemove];
  for (const h of headers) {
    let idx = existing.indexOf(h);
    while (idx !== -1) {
      const afterSection = existing.slice(idx + h.length);
      const nextHeaderMatch = afterSection.match(/\n# /);
      const endIdx = nextHeaderMatch ? idx + h.length + nextHeaderMatch.index : existing.length;
      existing = existing.slice(0, idx) + existing.slice(endIdx);
      idx = existing.indexOf(h);
    }
  }

  const updated = existing.trimEnd() ? existing.trimEnd() + '\n\n' + sectionContent : sectionContent;
  fs.writeFileSync(filePath, updated);
}

function buildDispatchRules(setsTargetDir, selectedSetIds) {
  const setsPath = setsTargetDir.replace(/\\/g, '/');
  return [
    '# Agent Dispatch Rules',
    '',
    '## Trigger & Usage',
    `- When the user asks to analyze, audit, review, debug, or fix issues (or explicitly mentions "agents-sets"), you MUST look up the available agent sets under \`${setsPath}/\` first.`,
    '- Do NOT perform the fixes or audits directly yourself. Instead, identify the appropriate agent set, describe it to the user, and ask for permission to dispatch it.',
    '',
    '## Permission',
    '- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"',
    '- Wait for explicit user approval before dispatching',
    '',
    '## Available Agent Sets',
    `- Sets installed in \`${setsPath}/\``,
    `- Installed set IDs: ${selectedSetIds.join(', ')}`,
    '- Each set JSON file has: id, name, category, description, agents[], outputPattern',
    '',
    '## Dispatch Rules',
    `- Find the matching set JSON file by ID in \`${setsPath}/\``,
    '- Read each agent\'s `"permission"` field from the set JSON (`"read"` or `"write"`)',
    '- For each agent in the set\'s agents array, dispatch subagents with:',
    '  - description: agent.name',
    '  - subagent_type: agent.file.replace(\'.md\', \'\')',
    '  - prompt: the task + the agent\'s specific `"role"` description from the set JSON. Do NOT include the full agent instruction markdown file in the prompt parameter, as the subagent automatically loads it via its type/skill name.',
    '- Dispatch read-only agents (`"permission": "read"`) in parallel',
    '- Dispatch write agents (`"permission": "write"`) **serially** — two agents editing the same file will conflict',
    '- If a set has both read-only and write agents, dispatch write agents serially AFTER all read agents finish',
    '- NEVER dispatch more than one agent set at a time — complete one set fully before starting another',
    '- After all agents in a set complete, compile the results before proceeding',
    '',
    '## Output Format',
    '- Each result must have: source set, agent name, finding, evidence',
    '- Compile into a structured report grouped by agent',
    '',
    '## Writing Rules',
    '- Use concise bullet points for findings',
    '- Evidence paths: file:line format',
    '- No commentary or editorializing in agent output',
    ''
  ].join('\n');
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
    for (const file of fs.readdirSync(pluginTarget)) {
      if (!fs.readdirSync(pkgInfo.pluginsDir).includes(file)) {
        try { fs.unlinkSync(path.join(pluginTarget, file)); } catch {}
      }
    }
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

      const rulesContent = buildDispatchRules(setsTargetDir, selectedSetIds);

      const agentsMdPath = targetConfig.scope === 'global'
        ? path.join(targetConfig.dir, 'AGENTS.md')
        : path.join(process.cwd(), 'AGENTS.md');

      updateMarkdownRule(agentsMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules'], '# Agent Dispatch Rules', rulesContent);
      return { agentCount: allAgentNames.length, targetDir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const targetDir = path.join(targetConfig.dir, 'agents');
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      if (isRemoveAll) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        fs.rmSync(setsTargetDir, { recursive: true, force: true });
        fs.rmSync(path.join(targetConfig.dir, 'plugins'), { recursive: true, force: true });
        const agentsMdPath = targetConfig.scope === 'global'
          ? path.join(targetConfig.dir, 'AGENTS.md')
          : path.join(process.cwd(), 'AGENTS.md');
        removeMarkdownRuleSection(agentsMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const af = path.join(targetDir, `${agName}.md`);
          if (fs.existsSync(af)) fs.unlinkSync(af);
        }
      }
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

      const rulesContent = buildDispatchRules(setsTargetDir, selectedSetIds);
      
      const ruleHeaders = ['# Agent Dispatch Rules', '# Agent Set Rules'];
      const agentsMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
      const geminiMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'GEMINI.md') : path.join(process.cwd(), 'GEMINI.md');

      updateMarkdownRule(agentsMdPath, ruleHeaders, '# Agent Dispatch Rules', rulesContent);
      updateMarkdownRule(geminiMdPath, ruleHeaders, '# Agent Dispatch Rules', rulesContent);
      return { agentCount: allAgentNames.length, targetDir: skillsTargetDir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const skillsTargetDir = path.join(targetConfig.dir, 'skills');
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      if (isRemoveAll) {
        fs.rmSync(skillsTargetDir, { recursive: true, force: true });
        fs.rmSync(setsTargetDir, { recursive: true, force: true });
        fs.rmSync(path.join(targetConfig.dir, 'plugins'), { recursive: true, force: true });
        const agentsMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
        const geminiMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'GEMINI.md') : path.join(process.cwd(), 'GEMINI.md');
        removeMarkdownRuleSection(agentsMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
        removeMarkdownRuleSection(geminiMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const sDir = path.join(skillsTargetDir, agName);
          if (fs.existsSync(sDir)) fs.rmSync(sDir, { recursive: true, force: true });
        }
      }
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

      const claudeMdPath = targetConfig.scope === 'global'
        ? path.join(targetConfig.dir, 'CLAUDE.md')
        : path.join(process.cwd(), 'CLAUDE.md');

      const rulesContent = buildDispatchRules(setsTargetDir, selectedSetIds);

      updateMarkdownRule(claudeMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules'], '# Agent Dispatch Rules', rulesContent);
      return { agentCount: allAgentNames.length, targetDir: agentsTargetDir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const agentsTargetDir = path.join(targetConfig.dir, 'agents');
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      const claudeMdPath = targetConfig.scope === 'global'
        ? path.join(targetConfig.dir, 'CLAUDE.md')
        : path.join(process.cwd(), 'CLAUDE.md');

      if (isRemoveAll) {
        fs.rmSync(agentsTargetDir, { recursive: true, force: true });
        fs.rmSync(setsTargetDir, { recursive: true, force: true });
        fs.rmSync(path.join(targetConfig.dir, 'plugins'), { recursive: true, force: true });
        removeMarkdownRuleSection(claudeMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const af = path.join(agentsTargetDir, `${agName}.md`);
          if (fs.existsSync(af)) fs.unlinkSync(af);
        }
      }
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

      const summaryContent = buildDispatchRules(setsTargetDir, selectedSetIds);
      const summaryFile = path.join(targetConfig.dir, 'agents-summary.md');
      fs.writeFileSync(summaryFile, summaryContent);
      return { agentCount: allAgentNames.length, targetDir: targetConfig.dir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      if (isRemoveAll) {
        fs.rmSync(targetConfig.dir, { recursive: true, force: true });
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const af = path.join(targetConfig.dir, `${agName}.md`);
          if (fs.existsSync(af)) fs.unlinkSync(af);
        }
      }
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

      const rulesContent = buildDispatchRules(setsTargetDir, selectedSetIds);

      const agentsMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
      updateMarkdownRule(agentsMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules'], '# Agent Dispatch Rules', rulesContent);

      return { agentCount: allAgentNames.length, targetDir: rulesTargetDir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const rulesTargetDir = path.join(targetConfig.dir, 'rules');
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      if (isRemoveAll) {
        fs.rmSync(rulesTargetDir, { recursive: true, force: true });
        fs.rmSync(setsTargetDir, { recursive: true, force: true });
        fs.rmSync(path.join(targetConfig.dir, 'plugins'), { recursive: true, force: true });
        const agentsMdPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, 'AGENTS.md') : path.join(process.cwd(), 'AGENTS.md');
        removeMarkdownRuleSection(agentsMdPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const af = path.join(rulesTargetDir, `${agName}.md`);
          if (fs.existsSync(af)) fs.unlinkSync(af);
        }
      }
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

      const rulesContent = buildDispatchRules(setsTargetDir, selectedSetIds);

      const cursorRulesPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, '.cursorrules') : path.join(process.cwd(), '.cursorrules');
      updateMarkdownRule(cursorRulesPath, ['# Agent Dispatch Rules', '# Agent Set Rules'], '# Agent Dispatch Rules', rulesContent);

      return { agentCount: allAgentNames.length, targetDir: rulesTargetDir };
    },
    uninstall(setIdsToRemove, agentNamesToRemove, targetConfig, isRemoveAll) {
      const rulesTargetDir = path.join(targetConfig.dir, 'rules');
      const setsTargetDir = path.join(targetConfig.dir, 'agents-sets');
      if (isRemoveAll) {
        fs.rmSync(rulesTargetDir, { recursive: true, force: true });
        fs.rmSync(setsTargetDir, { recursive: true, force: true });
        fs.rmSync(path.join(targetConfig.dir, 'plugins'), { recursive: true, force: true });
        const cursorRulesPath = targetConfig.scope === 'global' ? path.join(targetConfig.dir, '.cursorrules') : path.join(process.cwd(), '.cursorrules');
        removeMarkdownRuleSection(cursorRulesPath, ['# Agent Dispatch Rules', '# Agent Set Rules']);
      } else {
        for (const setObj of setIdsToRemove) {
          const sf = path.join(setsTargetDir, `${setObj}.json`);
          if (fs.existsSync(sf)) fs.unlinkSync(sf);
        }
        for (const agName of agentNamesToRemove) {
          const af = path.join(rulesTargetDir, `${agName}.mdc`);
          if (fs.existsSync(af)) fs.unlinkSync(af);
        }
      }
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
