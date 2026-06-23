# Agent Sets System — ModuSpell

**Project:** ModuSpell (Modular Grammar & Spell Checker)
**Last Updated:** 2026-06-23
**Source Agents:** `.opencode/agents/` directory

---

## Overview

Agent Sets are pre-defined groups of specialized AI subagents that work together to perform complex software engineering tasks. Each set is designed for a specific phase of the development workflow: **Finding Issues**, **Fixing Issues**, and **Researching Issues**.

---

## Available Agents (41 total)

All agents are located in `.opencode/agents/` directory:

| Agent | File | Specialty |
|-------|------|-----------|
| Code Reviewer | `code-reviewer.md` | Code quality, correctness, security |
| Performance Benchmarker | `performance-benchmarker.md` | Performance testing, optimization |
| Software Architect | `software-architect.md` | System design, architecture patterns |
| Evidence Collector | `evidence-collector.md` | Visual proof, QA, screenshots |
| Reality Checker | `reality-checker.md` | Feasibility, production readiness |
| Frontend Developer | `frontend-developer.md` | UI/UX, WPF, web technologies |
| Senior Developer | `senior-developer.md` | Best practices, implementation |
| Minimal Change Engineer | `minimal-change-engineer.md` | Smallest possible fix |
| Test Results Analyzer | `test-results-analyzer.md` | Test coverage, quality |
| Technical Writer | `technical-writer.md` | Documentation, guides |
| Codebase Onboarding Engineer | `codebase-onboarding-engineer.md` | Codebase exploration |
| Accessibility Auditor | `accessibility-auditor.md` | WCAG compliance, a11y |
| AI Engineer | `ai-engineer.md` | ML/AI integration |
| API Tester | `api-tester.md` | API testing, validation |
| Backend Architect | `backend-architect.md` | Server-side design |
| Database Optimizer | `database-optimizer.md` | DB performance, indexing |
| DevOps Automator | `devops-automator.md` | CI/CD, infrastructure |
| Git Workflow Master | `git-workflow-master.md` | Branching, version control |
| Incident Response Commander | `incident-response-commander.md` | Production incidents |
| Prompt Engineer | `prompt-engineer.md` | LLM prompt optimization |
| Rapid Prototyper | `rapid-prototyper.md` | MVP, proof of concept |
| Tool Evaluator | `tool-evaluator.md` | Technology assessment |
| Workflow Optimizer | `workflow-optimizer.md` | Process improvement |
| Multi-Agent Systems Architect | `multi-agent-systems-architect.md` | Agent pipeline design |
| AI Data Remediation Engineer | `ai-data-remediation-engineer.md` | Data pipeline repair |
| Autonomous Optimization Architect | `autonomous-optimization-architect.md` | Self-optimizing systems |
| CMS Developer | `cms-developer.md` | Drupal, WordPress |
| Data Engineer | `data-engineer.md` | ETL, data pipelines |
| Drupal Shopping Cart Engineer | `drupal-shopping-cart-engineer.md` | Drupal Commerce |
| Email Intelligence Engineer | `email-intelligence-engineer.md` | Email data extraction |
| Embedded Firmware Engineer | `embedded-firmware-engineer.md` | ESP32, STM32, bare metal |
| Feishu Integration Developer | `feishu-integration-developer.md` | Feishu/Lark platform |
| Filament Optimization Specialist | `filament-optimization-specialist.md` | Filament PHP admin |
| IT Service Manager | `it-service-manager.md` | ITIL, service management |
| Mobile App Builder | `mobile-app-builder.md` | iOS, Android, cross-platform |
| OrgScript Engineer | `orgscript-engineer.md` | OrgScript grammar, AST |
| Solidity Smart Contract Engineer | `solidity-smart-contract-engineer.md` | EVM, DeFi, Solidity |
| SRE (Site Reliability Engineer) | `sre-site-reliability-engineer.md` | SLOs, observability, chaos |
| Voice AI Integration Engineer | `voice-ai-integration-engineer.md` | Speech transcription, ASR |
| WeChat Mini Program Developer | `wechat-mini-program-developer.md` | WeChat ecosystem |
| WordPress Shopping Cart Engineer | `wordpress-shopping-cart-engineer.md` | WooCommerce |

---

## Category 1: Finding Issues

Sets designed to discover bugs, vulnerabilities, performance problems, and design flaws.

---

### Set 1.1: Code Audit

**Purpose:** Comprehensive code quality review to find bugs, anti-patterns, and quality issues.

**When to use:**
- User asks to "audit code", "review code", "find bugs"
- Before committing changes
- After implementing a feature
- During code review

**Agents (8):**

| Agent | Role | Permission |
|-------|------|------------|
| Code Reviewer | Primary reviewer — correctness, security, maintainability | Read |
| Performance Benchmarker | Identify performance bottlenecks | Read |
| Software Architect | Evaluate architecture and design patterns | Read |
| Evidence Collector | Document findings with visual proof | Read |
| Minimal Change Engineer | Assess if fixes can be minimal | Read |
| Test Results Analyzer | Check test coverage gaps | Read |
| Reality Checker | Validate findings are real, not fantasy | Read |
| Codebase Onboarding Engineer | Provide codebase context for findings | Read |

**Output:** `docs/agent-results/audit-{date}.md`

**Workflow:**
1. Code Reviewer scans all changed files
2. Performance Benchmarker identifies hot paths
3. Software Architect evaluates design decisions
4. Evidence Collector documents each finding
5. Minimal Change Engineer suggests minimal fixes
6. Test Results Analyzer checks test coverage
7. Reality Checker validates all findings
8. Codebase Onboarding Engineer provides context

---

### Set 1.2: Security Audit

**Purpose:** Find security vulnerabilities, injection risks, and auth bypasses.

**When to use:**
- User asks to "check security", "find vulnerabilities", "security audit"
- Before production deployment
- When handling user data or authentication

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Code Reviewer | Find injection, XSS, auth bypass vulnerabilities | Read |
| Backend Architect | Evaluate server-side security patterns | Read |
| API Tester | Test API endpoints for vulnerabilities | Read |
| Reality Checker | Validate security findings | Read |
| Evidence Collector | Document security issues with proof | Read |
| Technical Writer | Document security recommendations | Read |

**Output:** `docs/agent-results/security-audit-{date}.md`

---

### Set 1.3: Performance Audit

**Purpose:** Find performance bottlenecks, memory leaks, and optimization opportunities.

**When to use:**
- User asks to "check performance", "find slow parts", "optimize"
- When app feels sluggish
- Before release

**Agents (7):**

| Agent | Role | Permission |
|-------|------|------------|
| Performance Benchmarker | Primary — measure, profile, benchmark | Read |
| Code Reviewer | Find N+1 queries, unnecessary allocations | Read |
| Software Architect | Evaluate architectural performance trade-offs | Read |
| Frontend Developer | Check UI rendering performance | Read |
| Backend Architect | Check server-side performance | Read |
| Database Optimizer | Identify query performance issues | Read |
| Evidence Collector | Document performance metrics | Read |

**Output:** `docs/agent-results/perf-audit-{date}.md`

---

### Set 1.4: UI/UX Audit

**Purpose:** Find interface issues, accessibility problems, and UX friction.

**When to use:**
- User asks to "check UI", "review interface", "UX audit"
- When users report confusion
- Before design review

**Agents (7):**

| Agent | Role | Permission |
|-------|------|------------|
| Frontend Developer | Primary — check implementation, responsiveness | Read |
| Accessibility Auditor | WCAG compliance, screen reader support | Read |
| Evidence Collector | Screenshot issues, document UX problems | Read |
| Reality Checker | Validate UI claims are real | Read |
| Performance Benchmarker | Check UI rendering performance | Read |
| Code Reviewer | Check UI code quality | Read |
| Technical Writer | Document UI/UX recommendations | Read |

**Output:** `docs/agent-results/ui-audit-{date}.md`

---

### Set 1.5: Architecture Audit

**Purpose:** Evaluate system design, coupling, and architectural health.

**When to use:**
- User asks to "review architecture", "evaluate design"
- Before major refactoring
- When adding new modules

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Software Architect | Primary — evaluate patterns, trade-offs | Read |
| Code Reviewer | Check code adheres to architecture | Read |
| Senior Developer | Assess maintainability and complexity | Read |
| Codebase Onboarding Engineer | Map dependencies and module boundaries | Read |
| Reality Checker | Validate architectural claims | Read |
| Technical Writer | Document architecture decisions | Read |

**Output:** `docs/agent-results/arch-audit-{date}.md`

---

### Set 1.6: Test Coverage Audit

**Purpose:** Find untested code paths and test quality issues.

**When to use:**
- User asks to "check tests", "find untested code"
- Before merging PRs
- When test coverage drops

**Agents (5):**

| Agent | Role | Permission |
|-------|------|------------|
| Test Results Analyzer | Primary — analyze coverage, find gaps | Read |
| Code Reviewer | Check test quality and assertions | Read |
| Reality Checker | Validate test results are accurate | Read |
| Evidence Collector | Document test coverage gaps | Read |
| Technical Writer | Document testing recommendations | Read |

**Output:** `docs/agent-results/test-audit-{date}.md`

---

## Category 2: Fixing Issues

Sets designed to implement fixes, improvements, and refactoring.

---

### Set 2.1: Bug Fix

**Purpose:** Implement fixes for identified bugs.

**When to use:**
- After audit finds bugs
- User reports a bug
- When tests fail

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Senior Developer | Primary — implement fix with best practices | Write |
| Frontend Developer | Fix UI-related bugs | Write |
| Minimal Change Engineer | Ensure fix is minimal and targeted | Write |
| Code Reviewer | Review fix for correctness | Read |
| Performance Benchmarker | Verify fix doesn't hurt performance | Read |
| Test Results Analyzer | Verify fix is tested | Read |

**Output:** `docs/agent-results/fixes-{date}.md`

---

### Set 2.2: Refactoring

**Purpose:** Improve code structure without changing behavior.

**When to use:**
- User asks to "refactor", "clean up", "improve code"
- After audit finds code smells
- Before adding new features

**Agents (7):**

| Agent | Role | Permission |
|-------|------|------------|
| Senior Developer | Primary — implement refactoring | Write |
| Software Architect | Guide architectural decisions | Read |
| Minimal Change Engineer | Ensure changes are incremental | Read |
| Code Reviewer | Review refactoring quality | Read |
| Performance Benchmarker | Verify no performance regression | Read |
| Test Results Analyzer | Verify tests still pass | Read |
| Git Workflow Master | Manage commits and branching | Read |

**Output:** `docs/agent-results/refactor-{date}.md`

---

### Set 2.3: UI Fix

**Purpose:** Fix interface issues, styling bugs, and layout problems.

**When to use:**
- After UI audit finds issues
- User reports visual bugs
- When layout breaks

**Agents (5):**

| Agent | Role | Permission |
|-------|------|------------|
| Frontend Developer | Primary — implement UI fixes | Write |
| Accessibility Auditor | Ensure fixes maintain a11y | Read |
| Evidence Collector | Screenshot before/after | Read |
| Code Reviewer | Review UI code changes | Read |
| Reality Checker | Validate fixes look correct | Read |

**Output:** `docs/agent-results/ui-fixes-{date}.md`

---

### Set 2.4: Performance Fix

**Purpose:** Implement performance optimizations.

**When to use:**
- After performance audit finds bottlenecks
- User reports slowness
- When benchmarks regress

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Performance Benchmarker | Primary — implement optimizations | Write |
| Senior Developer | Implement code-level optimizations | Write |
| Database Optimizer | Optimize queries and indexing | Write |
| Code Reviewer | Review optimization changes | Read |
| Test Results Analyzer | Verify no behavior change | Read |
| Reality Checker | Validate improvements are real | Read |

**Output:** `docs/agent-results/perf-fixes-{date}.md`

---

### Set 2.5: Security Fix

**Purpose:** Patch security vulnerabilities.

**When to use:**
- After security audit finds vulnerabilities
- Before production deployment
- When handling sensitive data

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Senior Developer | Primary — implement security patches | Write |
| Backend Architect | Guide secure implementation patterns | Read |
| Code Reviewer | Review security fix | Read |
| API Tester | Test for vulnerability resolution | Read |
| Reality Checker | Validate fix is complete | Read |
| Technical Writer | Document security changes | Read |

**Output:** `docs/agent-results/security-fixes-{date}.md`

---

### Set 2.6: Documentation Fix

**Purpose:** Update and improve documentation.

**When to use:**
- After code changes
- When docs are outdated
- Before release

**Agents (4):**

| Agent | Role | Permission |
|-------|------|------------|
| Technical Writer | Primary — write/update documentation | Write |
| Codebase Onboarding Engineer | Provide codebase context | Read |
| Code Reviewer | Review documentation accuracy | Read |
| Reality Checker | Validate docs match implementation | Read |

**Output:** `docs/agent-results/doc-fixes-{date}.md`

---

## Category 3: Researching Issues

Sets designed to investigate problems, evaluate solutions, and gather information.

---

### Set 3.1: Root Cause Investigation

**Purpose:** Find the root cause of a bug or issue.

**When to use:**
- Bug is complex and cause is unclear
- User says "why is this broken?"
- When fix attempts fail

**Agents (7):**

| Agent | Role | Permission |
|-------|------|------------|
| Code Reviewer | Primary — trace code paths, find cause | Read |
| Software Architect | Evaluate system-level causes | Read |
| Performance Benchmarker | Check for performance-related causes | Read |
| Codebase Onboarding Engineer | Map dependencies and data flow | Read |
| Evidence Collector | Document investigation steps | Read |
| Reality Checker | Validate root cause hypothesis | Read |
| Test Results Analyzer | Check if tests reveal the issue | Read |

**Output:** `docs/agent-results/investigation-{date}.md`

---

### Set 3.2: Feasibility Assessment

**Purpose:** Evaluate if a proposed solution is feasible.

**When to use:**
- User proposes a solution
- Before implementing a major change
- When evaluating trade-offs

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Software Architect | Primary — evaluate architectural feasibility | Read |
| Senior Developer | Assess implementation complexity | Read |
| Performance Benchmarker | Evaluate performance impact | Read |
| Reality Checker | Validate feasibility claims | Read |
| Minimal Change Engineer | Suggest simpler alternatives | Read |
| Technical Writer | Document feasibility findings | Read |

**Output:** `docs/agent-results/feasibility-{date}.md`

---

### Set 3.3: Technology Research

**Purpose:** Evaluate libraries, frameworks, and tools.

**When to use:**
- User asks "should we use X?"
- Before adding new dependencies
- When evaluating technology options

**Agents (5):**

| Agent | Role | Permission |
|-------|------|------------|
| Tool Evaluator | Primary — evaluate technology options | Read |
| Software Architect | Assess fit with existing architecture | Read |
| Performance Benchmarker | Evaluate performance characteristics | Read |
| Reality Checker | Validate evaluation claims | Read |
| Technical Writer | Document technology comparison | Read |

**Output:** `docs/agent-results/tech-research-{date}.md`

---

### Set 3.4: Architecture Research

**Purpose:** Research architectural patterns and design approaches.

**When to use:**
- Planning major refactoring
- Designing new modules
- When architecture is unclear

**Agents (6):**

| Agent | Role | Permission |
|-------|------|------------|
| Software Architect | Primary — research patterns, trade-offs | Read |
| Senior Developer | Assess implementation patterns | Read |
| Codebase Onboarding Engineer | Map current architecture | Read |
| Multi-Agent Systems Architect | Evaluate agent-based patterns | Read |
| Reality Checker | Validate architectural research | Read |
| Technical Writer | Document architecture research | Read |

**Output:** `docs/agent-results/arch-research-{date}.md`

---

### Set 3.5: Codebase Exploration

**Purpose:** Understand unfamiliar code, map dependencies, and document structure.

**When to use:**
- Onboarding to new codebase
- Before making changes
- When code is unclear

**Agents (5):**

| Agent | Role | Permission |
|-------|------|------------|
| Codebase Onboarding Engineer | Primary — map codebase structure | Read |
| Software Architect | Identify architectural patterns | Read |
| Code Reviewer | Identify code quality patterns | Read |
| Evidence Collector | Document findings visually | Read |
| Technical Writer | Write codebase documentation | Read |

**Output:** `docs/agent-results/exploration-{date}.md`

---

### Set 3.6: Workflow Research

**Purpose:** Research development workflows and process improvements.

**When to use:**
- User asks to "improve workflow"
- When processes feel slow
- Before changing development practices

**Agents (5):**

| Agent | Role | Permission |
|-------|------|------------|
| Workflow Optimizer | Primary — analyze and improve workflows | Read |
| Git Workflow Master | Evaluate branching and version control | Read |
| DevOps Automator | Evaluate CI/CD improvements | Read |
| IT Service Manager | Assess process maturity | Read |
| Technical Writer | Document workflow recommendations | Read |

**Output:** `docs/agent-results/workflow-research-{date}.md`

---

## Full Workflow: Start to Finish

The complete workflow for using agent sets from project start to delivery:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FULL WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. EXPLORE        → Set 3.5 (Codebase Exploration)            │
│  2. UNDERSTAND     → Set 3.4 (Architecture Research)           │
│  3. PLAN           → Set 3.2 (Feasibility Assessment)          │
│  4. IMPLEMENT      → Set 2.1 (Bug Fix) / Set 2.2 (Refactor)   │
│  5. AUDIT          → Set 1.1 (Code Audit)                      │
│  6. FIX            → Set 2.1 (Bug Fix) / Set 2.3 (UI Fix)     │
│  7. REVIEW         → Set 1.1 (Code Audit)                      │
│  8. TEST           → Set 1.6 (Test Coverage Audit)             │
│  9. DOCUMENT       → Set 2.6 (Documentation Fix)               │
│ 10. DELIVER        → Set 1.2 (Security Audit) + Set 1.3 (Perf)│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1: Exploration & Understanding

```
Set 3.5: Codebase Exploration
  → Map codebase structure
  → Identify module boundaries
  → Document dependencies

Set 3.4: Architecture Research
  → Understand architectural patterns
  → Identify design decisions
  → Document architecture
```

### Phase 2: Planning & Design

```
Set 3.2: Feasibility Assessment
  → Evaluate proposed solutions
  → Assess implementation complexity
  → Document trade-offs

Set 3.3: Technology Research
  → Evaluate libraries and tools
  → Compare options
  → Document recommendations
```

### Phase 3: Implementation

```
Set 2.1: Bug Fix
  → Implement fixes for identified bugs
  → Write tests for fixes
  → Document changes

Set 2.2: Refactoring
  → Improve code structure
  → Maintain behavior
  → Incremental changes
```

### Phase 4: Quality Assurance

```
Set 1.1: Code Audit
  → Review code quality
  → Find remaining issues
  → Document findings

Set 1.6: Test Coverage Audit
  → Check test coverage
  → Find untested paths
  → Recommend tests
```

### Phase 5: Polish & Delivery

```
Set 2.3: UI Fix
  → Fix interface issues
  → Improve accessibility
  → Polish design

Set 2.4: Performance Fix
  → Optimize bottlenecks
  → Improve responsiveness
  → Benchmark improvements

Set 2.6: Documentation Fix
  → Update documentation
  → Write guides
  → Document decisions
```

### Phase 6: Final Validation

```
Set 1.2: Security Audit
  → Check for vulnerabilities
  → Validate auth patterns
  → Document security

Set 1.3: Performance Audit
  → Benchmark performance
  → Validate optimizations
  → Document metrics

Set 1.4: UI/UX Audit
  → Check accessibility
  → Validate UX
  → Document issues
```

---

## Permission Matrix

### Permission Types

| Permission | Description |
|------------|-------------|
| **Read** | Agent can read files but NOT modify them. Used for analysis, review, and research. |
| **Write** | Agent can read AND modify files. Used for implementation, fixes, and documentation. |
| **Both** | Agent can read and modify files, plus access external resources (APIs, databases). |

### Set Permission Summary

| Set | Category | Primary Permission | Write Agents |
|-----|----------|-------------------|--------------|
| 1.1 Code Audit | Finding | Read | None |
| 1.2 Security Audit | Finding | Read | None |
| 1.3 Performance Audit | Finding | Read | None |
| 1.4 UI/UX Audit | Finding | Read | None |
| 1.5 Architecture Audit | Finding | Read | None |
| 1.6 Test Coverage Audit | Finding | Read | None |
| 2.1 Bug Fix | Fixing | Write | Senior Dev, Frontend Dev, Minimal Change |
| 2.2 Refactoring | Fixing | Write | Senior Dev |
| 2.3 UI Fix | Fixing | Write | Frontend Dev |
| 2.4 Performance Fix | Fixing | Write | Perf Benchmarker, Senior Dev, DB Optimizer |
| 2.5 Security Fix | Fixing | Write | Senior Dev |
| 2.6 Documentation Fix | Fixing | Write | Technical Writer |
| 3.1 Root Cause Investigation | Researching | Read | None |
| 3.2 Feasibility Assessment | Researching | Read | None |
| 3.3 Technology Research | Researching | Read | None |
| 3.4 Architecture Research | Researching | Read | None |
| 3.5 Codebase Exploration | Researching | Read | None |
| 3.6 Workflow Research | Researching | Read | None |

### Agent Permission Summary

| Agent | Read Sets | Write Sets |
|-------|-----------|------------|
| Code Reviewer | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.5 | None |
| Performance Benchmarker | 1.1, 1.3, 1.4, 3.1, 3.3 | 2.4 |
| Software Architect | 1.1, 1.3, 1.5, 3.1, 3.2, 3.3, 3.4 | None |
| Evidence Collector | 1.1, 1.2, 1.4, 1.6, 3.1, 3.5 | None |
| Reality Checker | 1.1, 1.2, 1.3, 1.4, 1.6, 3.1, 3.2, 3.3, 3.4 | None |
| Frontend Developer | 1.3, 1.4, 1.6 | 2.1, 2.3 |
| Senior Developer | 1.5, 3.2, 3.4 | 2.1, 2.2, 2.4, 2.5 |
| Minimal Change Engineer | 1.1, 3.2 | 2.1 |
| Test Results Analyzer | 1.1, 1.6, 3.1 | None |
| Technical Writer | 1.2, 1.4, 1.5, 1.6, 3.2, 3.3, 3.4, 3.6 | 2.6 |
| Codebase Onboarding Engineer | 1.1, 1.5, 3.1, 3.4, 3.5 | None |
| Accessibility Auditor | 1.4 | 2.3 |
| API Tester | 1.2, 2.5 | None |
| Backend Architect | 1.2, 1.3 | 2.5 |
| Database Optimizer | 1.3 | 2.4 |
| Git Workflow Master | 2.2, 3.6 | None |
| DevOps Automator | 3.6 | None |
| IT Service Manager | 3.6 | None |
| Tool Evaluator | 3.3 | None |
| Workflow Optimizer | 3.6 | None |
| Multi-Agent Systems Architect | 3.4 | None |
| Rapid Prototyper | 3.2 | None |
| Prompt Engineer | 3.3 | None |

---

## Dispatch Protocol

### Step 1: Suggest the Dispatch

```
Main agent suggests:
"I'll dispatch {count} agents for {set name}:
 - {Agent 1}: {role}
 - {Agent 2}: {role}
 ...

Each will {what they'll do}. Results will be written to {output path}."
```

### Step 2: Wait for Approval

```
User must respond with:
- "go" / "ok" / "yes" → Proceed with dispatch
- "no" / "cancel" → Abort
- Modifications → Adjust and re-suggest
```

### Step 3: Dispatch Agents

```
For each agent in the set:
1. Write specific task prompt
2. Include file paths and line numbers
3. Specify permission level (Read/Write)
4. Dispatch via task tool
5. All agents run in parallel
```

### Step 4: Collect Results

```
For each agent:
1. Receive structured output
2. Never fabricate or assume results
3. Use only what agents returned
```

### Step 5: Compile Report

```
1. Follow output format (see below)
2. Write to docs/agent-results/
3. Report summary to user
```

---

## Output Format

### Finding Sets (1.x)

```markdown
# {Set Name} — {Count} Subagent Findings

**Date:** {date}
**Issue:** {description}
**Agents dispatched:** {list}

---

## FINDING 1 (SEVERITY) — {Title}

**Location:** `{file}` — `{method}` (line ~{n})
**Agents:** {list}

{Description}

---

## Summary

| # | Finding | Severity | Agents |
|---|---------|----------|--------|
| 1 | {title} | {severity} | {agents} |
```

### Fixing Sets (2.x)

```markdown
# {Set Name} — Fixes Applied

**Date:** {date}
**Source:** {source audit}
**Agents dispatched:** {list}

---

## Fixes Applied

- [X1] {what} | {file}:{line} | {before → after}
- [X2] {what} | {file}:{line} | {before → after}

## Verification

- Build: pass/fail
- Tests: pass/fail
- Notes: ...
```

### Researching Sets (3.x)

```markdown
# {Set Name} — Research Report

**Date:** {date}
**Topic:** {description}
**Agents dispatched:** {list}

---

## Findings

- {finding 1}
- {finding 2}

## Recommendations

- {recommendation 1}
- {recommendation 2}

## Next Steps

- {step 1}
- {step 2}
```

---

## Writing Rules

When writing to `docs/agent-results/`:

### Do

- Use shorthand for common terms
- Use bullets over paragraphs
- Max 3 lines per finding: what/where/fix
- Single combined file per set execution
- Use `---` between sections

### Don't

- Use code blocks unless showing exact fix
- Add agent signatures or timestamps per finding
- Write long paragraphs
- Include unnecessary detail
- Mix agent results with your own analysis

---

## Quick Reference

### Commands

```bash
# Build
dotnet build src/GrammarChecker/GrammarChecker.csproj

# Clean Build
dotnet clean && dotnet build

# Run
dotnet run --project src/GrammarChecker/GrammarChecker.csproj

# Test
dotnet test

# Lint
dotnet format
```

### File Locations

```
.opencode/agents/              → Agent definitions (41 agents)
.opencode/agent-sets-system.md → This file
AGENTS.md                      → Project agent rules
docs/agent-results/            → Agent output reports
```

### When to Use Each Category

| Situation | Category | Example Set |
|-----------|----------|-------------|
| "Find bugs" | Finding | 1.1 Code Audit |
| "Fix this bug" | Fixing | 2.1 Bug Fix |
| "Why is this broken?" | Researching | 3.1 Root Cause Investigation |
| "Check security" | Finding | 1.2 Security Audit |
| "Patch vulnerabilities" | Fixing | 2.5 Security Fix |
| "Should we use X?" | Researching | 3.3 Technology Research |
| "Review code" | Finding | 1.1 Code Audit |
| "Refactor this" | Fixing | 2.2 Refactoring |
| "How does this work?" | Researching | 3.5 Codebase Exploration |
