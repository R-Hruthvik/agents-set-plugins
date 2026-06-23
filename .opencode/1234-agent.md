# Agent Sets System Rules

### Agent Sets System
- Sets defined in: `.opencode/agent-sets-system.md`
- Output dir: `docs/agent-results/{set-name}-{date}.md`

#### Dispatch Rules
- ONLY dispatch agent sets when user explicitly asks ("use agents", "audit this", etc.)
- OR when absolutely necessary (complex multi-file changes, critical bugs)
- Agent must SUGGEST using subagents first, wait for user confirmation ("ok"/"go"/"yes")
- Never auto-dispatch without user approval

#### Full Cycle Workflow
```
Audit (1) → Fix (2) → Review (3) → Test (4) → Docs (5) → Validate (9)
```

#### Output Format
Each set writes to `docs/agent-results/{set-name}-{date}.md`
```
## Findings
- [F1] {what} | {where} | {fix}
- [F2] ...

## Fixes Applied
- [X1] {what} | {file}:{line} | {before → after}
- [X2] ...

## Verification
- Build: pass/fail
- Tests: pass/fail
- Notes: ...
```

#### Writing Rules
When writing to `docs/agent-results/`:
- Shorthand: "PMC = PlacementMode coordinate mismatch"
- Bullets over paragraphs
- No code blocks unless showing exact fix
- Max 3 lines per finding: what/where/fix
- No agent signatures, timestamps, or headers per finding
- Single combined file per set execution
- Use divs: `---` between Findings / Fixes Applied / Verification sections
