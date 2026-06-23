#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const VALID_MODES = ['primary', 'subagent', 'all'];
const VALID_PERM_ACTIONS = ['allow', 'ask', 'deny'];
const AGENTS_DIR = path.join(__dirname, '..', 'agents');

function validateAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];
  const warnings = [];

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    errors.push('Missing frontmatter (must start with ---)');
    return { valid: false, errors, warnings, agent: path.basename(filePath, '.md') };
  }

  const rawFm = fmMatch[1];
  const body = fmMatch[2].trim();

  if (!body) {
    errors.push('Empty body after frontmatter');
  }

  const fm = {};
  for (const line of rawFm.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) { warnings.push(`Unexpected line in frontmatter: "${line}"`); continue; }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    fm[key] = val;
  }

  if (!fm.description) errors.push('Missing required field: description');
  if (fm.mode && !VALID_MODES.includes(fm.mode)) errors.push(`Invalid mode: "${fm.mode}". Must be one of: ${VALID_MODES.join(', ')}`);

  if (fm.permission) {
    warnings.push('permission field found as string — expected nested object');
  }

  const required = ['description', 'mode'];
  for (const key of required) {
    if (!fm[key]) errors.push(`Missing recommended field: ${key}`);
  }

  return { valid: errors.length === 0, errors, warnings, agent: path.basename(filePath, '.md') };
}

function main() {
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`Format check: ${files.length} agent files\n`);

  for (const file of files) {
    const result = validateAgent(path.join(AGENTS_DIR, file));
    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`${result.valid ? 'OK' : 'FAIL'}  ${file}`);
      for (const e of result.errors) { console.log(`  ERROR: ${e}`); totalErrors++; }
      for (const w of result.warnings) { console.log(`  WARN:  ${w}`); totalWarnings++; }
    } else {
      console.log(`OK  ${file}`);
    }
  }

  console.log(`\n${files.length} files checked. ${totalErrors} errors, ${totalWarnings} warnings.`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
