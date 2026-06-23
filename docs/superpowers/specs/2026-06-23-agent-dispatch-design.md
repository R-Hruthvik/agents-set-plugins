# opencode-agents: V1 Design Doc

## Overview

`opencode-agents` is an NPM package that installs 41 specialized subagent `.md` files into an OpenCode environment, configures an AGENTS.md with concise dispatch rules, and includes a plugin that provides session lifecycle tracking and a `get_results` custom tool for compiling parallel subagent outputs.

## Architecture (V1)

```
┌─────────────────────────────────────────────────┐
│              OpenCode Session                     │
│  ┌──────────────┐   ┌─────────────────────────┐  │
│  │   AGENTS.md   │   │  .opencode/plugins/     │  │
│  │  (dispatch    │   │  agent-bridge.ts         │  │
│  │   rules +     │   │  - get_results tool      │  │
│  │   set ref)    │   │  - session.* hooks       │  │
│  └──────┬───────┘   └──────────┬──────────────┘  │
│         │                       │                 │
│  ┌──────▼───────────────────────▼──────────────┐  │
│  │          Main Agent                          │  │
│  │  Reads AGENTS.md → picks set                 │  │
│  │  Dispatches via task tool (Option A)         │  │
│  │  Calls get_results() → compiles output       │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  .opencode/agents/ (41 auto-discovered .md files)  │
└─────────────────────────────────────────────────────┘
```

## Components

### 1. Package (`opencode-agents`)

Files shipped in the NPM package:

```
opencode-agents/
├── bin/
│   └── opencode-agents.js     # CLI entry point
├── src/
│   ├── cli.js                  # Interactive installer (set selection, confirm)
│   ├── detector.js             # Three-tier scope detection
│   └── installer.js            # File copy + AGENTS.md generation + plugin copy
├── agents/
│   └── *.md                    # 41 reformatted agent files
├── sets/
│   └── *.json                  # 18 set definitions (stay in package)
├── scripts/
│   ├── format-checker.js       # Validate agent frontmatter
│   └── doctor.js               # Auto-fix frontmatter issues
├── plugins/
│   └── agent-bridge.ts         # Plugin with session hooks + get_results tool
├── docs/
│   └── plans/
│       └── dispatch-plugin-future.md  # Phase 2 plan
├── package.json
├── GOAL.md
└── README.md
```

### 2. AGENTS.md (User's Project Root)

Created/updated by the installer in the user's project root. Small (~50 lines), strict rules only:

```
# Agent Dispatch Rules

## Permission
- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"
- Wait for explicit user approval before dispatching

## Available Sets
- Reference: {package-install-path}/sets/  (18 sets available)

## Dispatch (Option A — V1)
- Find the matching set by ID/source in {package-install-path}/sets/
- For each agent in the set's agents array, call task tool with:
  - description: agent.name
  - subagent_type: agent.agent_type
  - prompt: the task + agent-specific instructions
- Dispatch agents in parallel using the set's outputPattern format
- After all agents complete, call the plugin's get_results() tool

## Dispatch (Option B — Future)
- [Instructions for when dispatch_set plugin tool is available]

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
```

### 3. Plugin (`agent-bridge.ts`)

Located at `.opencode/plugins/agent-bridge.ts` after install. Provides:

**Session Hooks:**
- `session.created` — Track subagent session creation with ID + title
- `session.status` — Track status transitions (pending → running → idle → completed)
- `session.idle` — Mark running sessions as completed when idle
- `session.error` — Record subagent failure + error message
- `session.deleted` — Ensure sessions not already completed are marked done on close
- `session.diff` — Capture file changes made by subagents

**Custom Tool: `get_results`**
- No arguments required
- Returns compiled results from all tracked subagent sessions:

**Custom Tool: `clear_results`**
- No arguments required
- Clears all tracked session data and findings to start fresh
  ```json
  {
    "findings": [{
      "agent_name": "senior-dev",
      "set_id": "bug-fix",
      "finding": "Memory leak in src/cache.ts:142",
      "evidence": "setInterval without clearInterval on component unmount",
      "severity": "high"
    }],
    "summary": "4 agents completed, 3 findings, 1 high severity",
    "agents": [
      {"name": "senior-dev", "status": "completed", "duration": 12000},
      {"name": "frontend-dev", "status": "completed", "duration": 8500},
      {"name": "minimal-change", "status": "error", "error": "timeout"}
    ]
  }
  ```

### 4. Agent Files (`.opencode/agents/*.md`)

41 files in OpenCode frontmatter format, auto-discovered by OpenCode.
Each has: name, agent_type, description, color, permissions sections, and instruction body.

## Detection & Install Flow

```
opencode-agents install
  ├── detector.js checks:
  │   └── Tier 1: .opencode/ exists in cwd → project-scoped install (no prompt)
  │   ├── Tier 2: ~/.config/opencode/ exists → prompt [P/g]
  │   └── Tier 3: nothing exists → prompt (Y/n) to scaffold .opencode/
  │
  ├── installer.js:
  │   ├── Copy agents/*.md → target/.opencode/agents/
  │   ├── Copy plugins/agent-bridge.ts → target/.opencode/plugins/
  │   ├── Read package install path (via require.resolve or __dirname)
  │   ├── Generate AGENTS.md with dynamic package path embedded
  │   └── Write AGENTS.md to project root (or global root if global)
  │
  └── Done. User is told: "Installed [N] agents. Installed plugin. Restart OpenCode."
```

## What V1 Excludes

- **`dispatch_set` custom tool** — Phase 2 (documented in `docs/plans/dispatch-plugin-future.md`)
- **Orchestrator** — Phase 5 of GOAL.md
- **Marketplace** — Phase 7 of GOAL.md
- **Interactive agent editing** — Use `opencode-agents-format` and `opencode-agents-doctor` for validation

## File Dependencies

| File | Depends On | Description |
|------|-----------|-------------|
| `bin/opencode-agents.js` | `src/cli.js` | CLI entry point |
| `src/cli.js` | `src/detector.js`, `src/installer.js` | Interactive installer |
| `src/installer.js` | — | File copy + AGENTS.md gen + plugin copy |
| `src/detector.js` | — | Three-tier detection |
| `scripts/format-checker.js` | — | Frontmatter validation |
| `scripts/doctor.js` | `scripts/format-checker.js` | Auto-fix |
| `plugins/agent-bridge.ts` | — | Plugin (standalone) |

## Permissions Model (V1)

Per-set permissions are documented in each `sets/*.json` and referenced by AGENTS.md:

| Level | Agents | Restrictions |
|-------|--------|-------------|
| Read-only | Code Audit, Security Audit, Research agents | edit: deny, bash: deny |
| Full Write | Bug Fix agents (Senior Dev, Frontend Dev, Minimal Change) | edit: allow, bash: allow |

In V1, permissions are enforced by AGENTS.md instructions to the main agent.
In Phase 2, the plugin enforces them directly.
