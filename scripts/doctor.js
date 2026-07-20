#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const VALID_MODES = ['primary', 'subagent', 'all'];
const AGENTS_DIR = path.join(__dirname, '..', 'agents');

function validateAndFix(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  let modified = false;

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return { fixed: false, issues: ['No frontmatter found — cannot auto-fix'] };
  }

  let rawFm = fmMatch[1];
  const body = fmMatch[2].trim();
  const agentName = path.basename(filePath, '.md');

  const fm = {};
  const fmLines = rawFm.split('\n');
  for (const line of fmLines) {
    if (line.trim() === '') continue;
    const idx = line.indexOf(':');
    if (idx === -1) { issues.push(`Unexpected line removed: "${line}"`); continue; }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    fm[key] = val;
  }

  if (!fm.description) {
    fm.description = `${agentName} agent`;
    issues.push('Added missing description');
    modified = true;
  }

  if (!fm.mode) {
    fm.mode = 'subagent';
    issues.push('Added missing mode: subagent');
    modified = true;
  } else if (!VALID_MODES.includes(fm.mode)) {
    issues.push(`Invalid mode "${fm.mode}" — left as-is for manual fix`);
  }

  const permKeys = ['read', 'edit', 'bash', 'grep', 'glob', 'webfetch', 'websearch', 'task'];
  const permObj = {};
  for (const k of permKeys) {
    if (fm[k]) {
      if (VALID_PERM_ACTIONS.includes(fm[k])) {
        permObj[k] = fm[k];
      } else {
        permObj[k] = fm[k];
      }
      delete fm[k];
    }
  }

  const ordered = ['description'];
  if (Object.keys(permObj).length > 0) ordered.push('permission');
  ordered.push('mode');

  if (fm.model) ordered.push('model');
  if (fm.temperature) ordered.push('temperature');
  if (fm.steps) ordered.push('steps');
  if (fm.color) ordered.push('color');
  if (fm.hidden) ordered.push('hidden');

  let outFm = '';
  for (const key of ordered) {
    if (key === 'permission') {
      outFm += 'permission:\n';
      for (const [pk, pv] of Object.entries(permObj)) {
        outFm += `  ${pk}: ${pv}\n`;
      }
    } else if (fm[key] !== undefined) {
      outFm += `${key}: ${fm[key]}\n`;
    }
  }

  const output = `---\n${outFm}---\n\n${body}\n`;

  if (modified || JSON.stringify(fm) !== JSON.stringify(parseRawFrontmatter(rawFm))) {
    fs.writeFileSync(filePath, output, 'utf-8');
  }

  return { fixed: modified, issues };
}

function parseRawFrontmatter(raw) {
  const fm = {};
  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    fm[key] = val;
  }
  return fm;
}

const VALID_PERM_ACTIONS = ['allow', 'ask', 'deny'];

function main() {
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let fixed = 0;
  let failed = 0;

  console.log(`Doctor mode: ${files.length} agent files\n`);

  for (const file of files) {
    const result = validateAndFix(path.join(AGENTS_DIR, file));
    if (result.fixed) {
      console.log(`FIXED ${file}`);
      for (const issue of result.issues) console.log(`  - ${issue}`);
      fixed++;
    } else if (result.issues.length > 0 && !result.fixed) {
      console.log(`FAIL ${file}`);
      for (const issue of result.issues) console.log(`  - ${issue}`);
      failed++;
    } else {
      console.log(`OK   ${file}`);
    }
  }

  console.log(`\nDone. ${fixed} fixed, ${failed} failed (manual fix needed).`);
}

main();
