# Universal AI Agent & Agent Sets Installer

A universal dynamic agent and agent-set installation system for AI Coding Assistant Frameworks. Supports **OpenCode**, **Google Antigravity / Gemini CLI**, **Claude Code**, **Cline**, **Kilo Code / Kilocode**, and **Cursor** with 41 specialized subagents across 18 agent sets.

---

## 🚀 Features

- **Multi-Framework Auto-Detection**: Automatically detects active AI agent frameworks in your workspace or global environment.
- **Project Scope vs. Global Scope (`[P/g]`)**: Choose whether to install rules & agents in your current project repository or globally across all projects on your machine.
- **Interactive Framework Fallback**: If no AI framework is detected automatically, type your preferred framework name to detect/initialize, or view the full list of compatible agent sets.
- **Native Subagent & Rule Formatting**: Generates framework-native agent definitions and rules:
  - **OpenCode**: Writes to `.opencode/agents/`, `.opencode/agents-sets/`, `.opencode/plugins/`, and `AGENTS.md`.
  - **Google Antigravity / Gemini CLI**: Writes skills to `.agents/skills/` (or `.gemini/config/skills/`) and updates both `GEMINI.md` and `AGENTS.md`.
  - **Claude Code**: Writes subagents to `.claude/agents/*.md` with YAML frontmatter (`name`, `description`, `tools`) and updates `CLAUDE.md`.
  - **Cline**: Writes modular rules to `.clinerules/*.md` and `.clinerules/agents-summary.md`.
  - **Kilo Code / Kilocode**: Writes rules to `.kilo/rules/*.md`, registers globs in `kilo.jsonc`, and updates `AGENTS.md`.
  - **Cursor**: Writes MDC rule files to `.cursor/rules/*.mdc` with frontmatter (`description`, `alwaysApply: false`) and updates `.cursorrules`.

---

## 📦 Installation & Usage

```bash
# Global installation via NPM
npm install -g opencode-agents

# Run the universal installer
opencode-agents

# Or run directly via npx
npx opencode-agents
```

### Additional Utilities

```bash
# Check agent file formatting
opencode-agents-format

# Run full validation & auto-fix doctor
opencode-agents-doctor
```

---

## 🎯 Supported AI Agent Frameworks

| Framework | Project Directory | Global Directory | Generated Rule File(s) |
| :--- | :--- | :--- | :--- |
| **OpenCode** | `.opencode/` | `~/.config/opencode/` | `AGENTS.md` |
| **Google Antigravity / Gemini CLI** | `.agents/` or `.gemini/` | `~/.gemini/config/` | `GEMINI.md` & `AGENTS.md` |
| **Claude Code** | `.claude/` | `~/.claude/` | `CLAUDE.md` |
| **Cline** | `.clinerules/` | `~/.clinerules/` | `.clinerules/agents-summary.md` |
| **Kilo Code / Kilocode** | `.kilo/` | `~/.config/kilo/` | `kilo.jsonc` & `AGENTS.md` |
| **Cursor** | `.cursor/` | `~/.cursor/` | `.cursorrules` & `.cursor/rules/*.mdc` |

---

## 🧩 Agent Sets & Included Subagents

### 🔍 Finding & Auditing Issues
| Agent Set | Included Subagents |
| :--- | :--- |
| **Code Audit** | 8 agents (`accessibility-auditor`, `api-tester`, `code-reviewer`, `database-optimizer`, `security-auditor`, etc.) |
| **Security Audit** | 6 agents (`security-auditor`, `solidity-smart-contract-engineer`, `sre`, etc.) |
| **Performance Audit** | 7 agents (`autonomous-optimization-architect`, `database-optimizer`, `performance-engineer`, etc.) |
| **UI/UX Audit** | 7 agents (`accessibility-auditor`, `mobile-app-builder`, `rapid-prototyper`, etc.) |
| **Architecture Audit** | 6 agents (`backend-architect`, `data-engineer`, `devops-automator`, etc.) |
| **Test Coverage Audit** | 5 agents (`api-tester`, `qa-engineer`, `test-coverage-auditor`, etc.) |

### 🛠️ Fixing & Refactoring Issues
| Agent Set | Included Subagents |
| :--- | :--- |
| **Bug Fix** | 6 agents (`incident-response-commander`, `qa-engineer`, `code-reviewer`, etc.) |
| **Refactoring** | 7 agents (`codebase-onboarding-engineer`, `workflow-optimizer`, `backend-architect`, etc.) |
| **UI Fix** | 5 agents (`cms-developer`, `drupal-shopping-cart-engineer`, `wordpress-shopping-cart-engineer`, etc.) |
| **Performance Fix** | 6 agents (`autonomous-optimization-architect`, `database-optimizer`, `workflow-optimizer`, etc.) |
| **Security Fix** | 6 agents (`security-auditor`, `solidity-smart-contract-engineer`, `devops-automator`, etc.) |
| **Documentation Fix** | 4 agents (`technical-writer`, `prompt-engineer`, `tool-evaluator`, etc.) |

### 🔬 Research & Exploration
| Agent Set | Included Subagents |
| :--- | :--- |
| **Root Cause Investigation** | 7 agents (`incident-response-commander`, `sre`, `git-workflow-master`, etc.) |
| **Feasibility Assessment** | 6 agents (`ai-engineer`, `voice-ai-integration-engineer`, `feishu-integration-developer`, etc.) |
| **Technology Research** | 5 agents (`ai-data-remediation-engineer`, `email-intelligence-engineer`, `embedded-firmware-engineer`, etc.) |
| **Architecture Research** | 6 agents (`backend-architect`, `it-service-manager`, `orgscript-engineer`, etc.) |
| **Codebase Exploration** | 5 agents (`codebase-onboarding-engineer`, `wechat-mini-program-developer`, etc.) |
| **Workflow Research** | 5 agents (`git-workflow-master`, `workflow-optimizer`, `tool-evaluator`, etc.) |

---

## 📁 Project Structure

```
agents-set-plugins/
├── bin/
│   ├── opencode-agents.js          # CLI entry point
│   ├── opencode-agents-doctor.js   # Validation doctor CLI
│   └── opencode-agents-format.js   # Format checker CLI
├── src/
│   ├── cli.js                      # Universal interactive CLI installer
│   ├── detector.js                 # Multi-framework detection engine
│   ├── frameworks.js               # Framework adapters (OpenCode, Antigravity, Claude, Cline, Kilo, Cursor)
│   ├── installer.js                # Multi-target agent & rules installer
│   ├── configurator.js             # Configuration file manager
│   └── doctor.js                   # Validation engine
├── agents/                         # 41 specialized subagent markdown definitions
├── sets/                           # 18 agent-set JSON definitions
├── plugins/                        # Event lifecycle bridge plugins
├── test/
│   └── frameworks.test.js          # Automated multi-framework test suite
└── package.json
```

---

## 📄 License

MIT
