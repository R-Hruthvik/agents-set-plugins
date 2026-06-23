# opencode-agents

Universal dynamic agent system for OpenCode — 41 specialized subagents across 18 agent sets.

## Install

```bash
npm install -g opencode-agents
```

## Usage

```bash
# Run the installer
opencode-agents

# Check agent file formatting
opencode-agents-format

# Full validation + auto-fix
opencode-agents-doctor
```

## Agent Sets

### Finding Issues
| Set | Agents |
|-----|--------|
| Code Audit | 8 |
| Security Audit | 6 |
| Performance Audit | 7 |
| UI/UX Audit | 7 |
| Architecture Audit | 6 |
| Test Coverage Audit | 5 |

### Fixing Issues
| Set | Agents |
|-----|--------|
| Bug Fix | 6 |
| Refactoring | 7 |
| UI Fix | 5 |
| Performance Fix | 6 |
| Security Fix | 6 |
| Documentation Fix | 4 |

### Researching Issues
| Set | Agents |
|-----|--------|
| Root Cause Investigation | 7 |
| Feasibility Assessment | 6 |
| Technology Research | 5 |
| Architecture Research | 6 |
| Codebase Exploration | 5 |
| Workflow Research | 5 |

## Project Structure

```
opencode-agents/
├── bin/opencode-agents.js   CLI entry
├── src/cli.js               Interactive installer
├── src/detector.js          OpenCode detection
├── src/installer.js         Agent & config install
├── src/configurator.js      opencode.json management
├── agents/                  41 agent definitions
├── sets/                    18 set definitions
├── scripts/format-checker   Validate agent format
├── scripts/doctor           Auto-fix agent files
├── GOAL.md                  Roadmap to Option 4
└── package.json
```

## License

MIT
"# agents-set-plugins" 
