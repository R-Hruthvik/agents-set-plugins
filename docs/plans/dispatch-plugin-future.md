# Phase 2: Plugin Custom Tool for Dispatch

**Status:** Planned (not implemented)
**Target Version:** 2.0.0+

---

## Rationale

V1 (Phase 1) uses Option A — the main agent dispatches subagents via the `task` tool directly, following instructions in `AGENTS.md`. This works but has drawbacks:

- **Context bloat** — The main agent manages dispatch tracking inline
- **No centralized tracking** — Parallel agent outputs are scattered across sessions
- **Manual permission enforcement** — AGENTS.md must instruct the agent on permissions per set
- **No result compilation** — The main agent must manually read and compile each subagent's output

Phase 2 (Option B) introduces an OpenCode plugin that wraps dispatch into a single custom tool call.

---

## Architecture

```
User: "audit this codebase"
  → Main agent reads AGENTS.md
  → Calls dispatch_set(setId="code-audit", task="audit @src")
    → Plugin reads agent-sets.json from package
    → Plugin dispatches subagents via task tool
    → Plugin tracks sessions via session.* hooks
    → Plugin collects outputs
  → Main agent calls get_results()
    → Returns compiled report
  → Main agent presents to user
```

---

## What Changes

### 1. New Plugin File: `plugins/dispatch-agent.ts`

An OpenCode plugin that:

**Custom Tool: `dispatch_set`**
- `setId`: string — which set to dispatch (e.g., `"code-audit"`)
- `task`: string — the specific task prompt for each agent
- `options.parallel`: boolean (default: true) — dispatch all agents at once
- `options.permissions`: object — override default permissions per agent
- Returns: `{ dispatchId: string, agentCount: number, sessions: string[] }`

**Custom Tool: `get_results`**
- `dispatchId`: string — the dispatch ID from `dispatch_set`
- Returns: `{ findings: Finding[], summary: string, agents: AgentResult[] }`

**Session Hooks**
- `session.created` — Track when subagent sessions start
- `session.updated` / `session.status` — Monitor progress
- `session.diff` — Capture what each subagent changed
- `session.deleted` — Subagent finished, compile its output
- `session.error` — Handle subagent failures

### 2. AGENTS.md Changes

The dispatch rules section updates from:

```markdown
### Dispatch
- When user asks for audit/fix/research, find the matching set in {package-path}/sets/
- Dispatch agents using the task tool with their agent names
- Wait for user approval before dispatching
```

To:

```markdown
### Dispatch
- When user asks for audit/fix/research, find the matching set in {package-path}/sets/
- Use the `dispatch_set` custom tool (provided by the plugin) to dispatch agent sets
- After dispatch completes, use `get_results` to pull compiled findings
- Wait for user approval before dispatching
```

### 3. Installer Changes

The installer gains a new step:
- Copy `plugins/dispatch-agent.ts` to `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global)

---

## Migration Path

- The plugin checks if `dispatch_set` tool is available in the current session
- If yes → use Option B flow (custom tool dispatch)
- If no → fall back to Option A (manual `task` tool dispatch per AGENTS.md instructions)
- V1 AGENTS.md must include instructions for both paths so the agent can fall back gracefully

---

## Permission Model

The plugin enforces per-set permissions automatically:

| Set | Primary Permission | Write Agents |
|-----|-------------------|--------------|
| Code Audit (1.1) | Read | None |
| Security Audit (1.2) | Read | None |
| Bug Fix (2.1) | Write | Senior Dev, Frontend Dev, Minimal Change |
| ... | ... | ... |

Agents with `Read` permission get `edit: deny` and `bash: deny`.
Agents with `Write` permission get `edit: allow` and `bash: allow` with restrictions.

---

## Files to Create

```
opencode-agents/
├── plugins/
│   └── dispatch-agent.ts      # Plugin with custom tools + session hooks
├── src/
│   └── orchestrator.js         # Shared orchestrator logic (used by plugin)
├── docs/plans/
│   └── dispatch-plugin-future.md  # This file
└── package.json                # Add @opencode-ai/plugin as dependency
```
