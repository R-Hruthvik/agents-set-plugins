# Agent Sets System — Complete Guide

**Project:** ModuSpell (Modular Grammar & Spell Checker)
**Last Updated:** 2026-06-23

---

## Table of Contents

1. [What is the Agent Sets System?](#1-what-is-the-agent-sets-system)
2. [Why It Exists](#2-why-it-exists)
3. [How It Works](#3-how-it-works)
4. [AGENTS.md Rules](#4-agentsmd-rules)
5. [Available Agents](#5-available-agents)
6. [Agent Sets by Category](#6-agent-sets-by-category)
7. [Permission System](#7-permission-system)
8. [Dispatch Workflow](#8-dispatch-workflow)
9. [Full Cycle Workflow](#9-full-cycle-workflow)
10. [Output Format](#10-output-format)
11. [Writing Rules](#11-writing-rules)
12. [Examples from Real Usage](#12-examples-from-real-usage)
13. [Do's and Don'ts](#13-dos-and-donts)

---

## 1. What is the Agent Sets System?

The Agent Sets System is a structured workflow for using **multiple AI subagents** to perform complex software engineering tasks. Instead of one agent doing everything, you dispatch **specialized agents** (Code Reviewer, Performance Benchmarker, Software Architect, etc.) to work on specific aspects of a problem in parallel.

### Core Concept

```
User Request → Main Agent (orchestrator) → Dispatches Subagents → Collects Results → Reports Back
```

The main agent acts as an **orchestrator**. It:
- Understands the user's request
- Decides which subagents to dispatch
- Sends each subagent a specific, focused task
- Collects all results
- Compiles them into a structured report
- Never hallucinates or makes up subagent outputs

---

## 2. Why It Exists

### Problem: Single-Agent Limitations

A single AI agent trying to do everything at once:
- Loses context across large codebases
- Can't maintain multiple perspectives simultaneously
- Makes mistakes when juggling many concerns
- Produces inconsistent quality across different aspects

### Solution: Parallel Specialized Agents

Multiple agents working in parallel:
- Each agent focuses on ONE thing (specialization)
- Each agent has its own fresh context
- Agents can work simultaneously (parallelism)
- Results are compiled into a comprehensive report
- No single point of failure

### Real Example: Tooltip Bug Fix

```
User: "Tooltip doesn't show when hovering over misspelled words"

Single agent approach:
→ Tries to find the bug, fix it, test it, document it all at once
→ Might miss the coordinate space issue
→ Might not consider performance implications
→ Might not verify the fix properly

Agent Sets approach:
→ 10 agents dispatched in parallel
→ Code Reviewer: finds coordinate mismatch
→ Performance Benchmarker: identifies flickering cause
→ Software Architect: finds race condition
→ Frontend Developer: finds PositionFromPoint issue
→ Each agent reports independently
→ Main agent compiles all findings
→ User gets comprehensive audit report
```

---

## 3. How It Works

### Step-by-Step Flow

```
1. User makes request
   "use agents to audit the tooltip system"

2. Main agent reads AGENTS.md
   → Checks dispatch rules
   → Confirms user explicitly asked for agents

3. Main agent SUGGESTS the dispatch
   "I'll dispatch 10 agents to audit:
    - Code Reviewer (code quality)
    - Performance Benchmarker (performance)
    - Software Architect (architecture)
    ..."

4. User approves
   "go" / "ok" / "yes"

5. Main agent dispatches subagents
   → Each gets a specific task prompt
   → Each works independently
   → Each returns structured results

6. Main agent collects results
   → Never fabricates results
   → Uses only what subagents returned

7. Main agent writes report
   → Following output format rules
   → Writing to docs/agent-results/

8. Main agent reports to user
   "Audit complete. Found 6 issues:
    - F1 (CRITICAL): coordinate mismatch
    - F2 (MEDIUM): dictionary equality
    ..."
```

---

## 4. AGENTS.md Rules

The `AGENTS.md` file is the **master configuration** for how agents work in this project. Key rules:

### Dispatch Rules (MANDATORY)

```
1. ONLY dispatch agent sets when user explicitly asks
   → "use agents", "audit this", "dispatch agents"

2. OR when absolutely necessary
   → Complex multi-file changes
   → Critical bugs affecting multiple systems

3. Agent must SUGGEST using subagents FIRST
   → Wait for user confirmation ("ok"/"go"/"yes")

4. NEVER auto-dispatch without user approval
   → This is a hard rule, no exceptions
```

### Why These Rules Exist

- **User control**: The user decides when agents are needed
- **Cost awareness**: Agent dispatch uses more tokens/resources
- **Avoid surprise**: User should know what agents will do
- **Prevent waste**: Not every task needs parallel agents

### Code Style Rules (for agents)

```
- Language: C# 10+ with modern features
- Naming: PascalCase for classes/methods, camelCase for locals, _camelCase for privates
- Braces: Allman style
- Imports: Group system, then third-party, then local
- Async: Use async/await; suffix Async on methods
- Threading: Background tasks with Task.Run; UI updates via Dispatcher
- MVVM: Strict separation; no logic in code-behind
- Error Handling: Try-catch with logging; custom exceptions for business rules
```

### Architecture Rules (for agents)

```
- Interfaces: ICheckerService for all engines
- Decoupling: UI never calls checking logic directly
- Async: All analysis methods async and background-threaded
- UI Updates: Always via Dispatcher.Invoke/BeginInvoke
- Modularity: Pluggable engines; DI for injection
```

---

## 5. Available Agents

All agents are located in `.opencode/agents/` directory. Each agent file contains frontmatter with name, description, mode (subagent), and color.

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

## 6. Agent Sets by Category

Sets are organized into three categories: **Finding Issues**, **Fixing Issues**, and **Researching Issues**. Each category contains multiple sets with 5-10 agents per set.

---

### Category 1: Finding Issues

Sets designed to discover bugs, vulnerabilities, performance problems, and design flaws.

#### Set 1.1: Code Audit

**Purpose:** Comprehensive code quality review to find bugs, anti-patterns, and quality issues.

**When to use:**
- User asks to "audit code", "review code", "find bugs"
- Before committing changes
- After implementing a feature

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

---

#### Set 1.2: Security Audit

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

#### Set 1.3: Performance Audit

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

#### Set 1.4: UI/UX Audit

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

#### Set 1.5: Architecture Audit

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

#### Set 1.6: Test Coverage Audit

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

### Category 2: Fixing Issues

Sets designed to implement fixes, improvements, and refactoring.

#### Set 2.1: Bug Fix

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

#### Set 2.2: Refactoring

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

#### Set 2.3: UI Fix

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

#### Set 2.4: Performance Fix

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

#### Set 2.5: Security Fix

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

#### Set 2.6: Documentation Fix

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

### Category 3: Researching Issues

Sets designed to investigate problems, evaluate solutions, and gather information.

#### Set 3.1: Root Cause Investigation

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

#### Set 3.2: Feasibility Assessment

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

#### Set 3.3: Technology Research

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

#### Set 3.4: Architecture Research

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

#### Set 3.5: Codebase Exploration

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

#### Set 3.6: Workflow Research

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

## 7. Permission System

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

## 8. Dispatch Workflow

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
1. Follow output format (see Section 10)
2. Write to docs/agent-results/
3. Report summary to user
```

---

## 9. Full Cycle Workflow

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

## 10. Output Format

All agent results go to `docs/agent-results/{set-name}-{date}.md`

### Standard Structure

```markdown
# {Task Name} — {Agent Count} Subagent Findings

**Date:** {date}
**Issue:** {brief description}
**Agents dispatched:** {list}

---

## FINDING 1 (SEVERITY) — {Title}

**Location:** `file.cs` — `Method` (line ~{n})
**Agents:** {list}

{Description of the issue}

**Evidence:**
- {evidence point 1}
- {evidence point 2}

---

## FINDING 2 (SEVERITY) — {Title}

...

---

## Verified Facts

- {fact 1}
- {fact 2}

---

## Summary

| # | Finding | Severity | Agents |
|---|---------|----------|--------|
| 1 | {title} | {severity} | {agents} |
| 2 | {title} | {severity} | {agents} |
```

### For Fix Reports

```markdown
# Fixes Applied — {System Name}

**Date:** {date}
**Source:** {source audit}
**Agents dispatched:** {list}

---

## Fixes Applied

- [X1] {what} | {file}:{line} | {before → after}
- [X2] {what} | {file}:{line} | {before → after}

## Findings with No Fix Needed

- [F{N}] {what} — {reason}

## Verification

- Build: pass/fail
- Tests: pass/fail
- Notes: ...

## Changed Lines

| Line | Before | After |
|------|--------|-------|
| {n} | {old} | {new} |
```

---

## 11. Writing Rules

When writing to `docs/agent-results/`:

### Do

- Use shorthand: "PMC = PlacementMode coordinate mismatch"
- Use bullets over paragraphs
- Max 3 lines per finding: what/where/fix
- Single combined file per set execution
- Use dividers: `---` between sections

### Don't

- Use code blocks unless showing exact fix
- Add agent signatures, timestamps, or headers per finding
- Write long paragraphs
- Include unnecessary detail

### Example Finding

```markdown
## FINDING 1 (CRITICAL) — PlacementRectangle Coordinate Space Mismatch

**Location:** `MainWindow.xaml.cs` — `ShowTooltip` method (line ~328)
**Agents:** 6+ agree

`GetCharacterRect()` returns FlowDocument content coordinates. `PlacementMode.Top` with `PlacementRectangle` expects RichTextBox control-local coordinates. Tooltip renders off-screen.
```

---

## 12. Examples from Real Usage

### Example 1: Tooltip Audit (10 agents)

```
User: "use agents to audit the tooltip system"

Main agent:
1. Reads AGENTS.md — confirms user asked for agents
2. Suggests dispatch:
   "I'll dispatch 10 agents:
    - Code Reviewer (code quality)
    - Evidence Collector (visual proof)
    - Reality Checker (feasibility)
    - Frontend Developer (UI/UX)
    - Senior Developer (best practices)
    - Minimal Change Engineer (smallest fix)
    - Software Architect (architecture)
    - Performance Benchmarker (performance)
    - Test Results Analyzer (testing)
    - Codebase Onboarding Engineer (codebase)

    Each will analyze the tooltip system and report findings."

3. User: "go"

4. Main agent dispatches all 10 in parallel

5. Each returns findings

6. Main agent compiles into audit-2026-06-22.md

7. Reports to user:
   "Audit complete. Found 6 issues:
    - F1 (CRITICAL): coordinate mismatch
    - F2 (MEDIUM): dictionary equality
    - F3 (MEDIUM): TextChanged re-trigger
    - F4 (LOW): tooltip recreation
    - F5 (LOW): race condition
    - F6 (LOW): PositionFromPoint null"
```

### Example 2: Fix Implementation (2 agents)

```
User: "ok now use another set to fix"

Main agent:
1. Suggests dispatch:
   "I'll dispatch 2 agents:
    - Code Reviewer: fix F3 (re-entrancy guard)
    - Senior Developer: fix F1+F4 (tooltip positioning)

    Each will make specific code changes."

2. User: "go"

3. Both agents work in parallel on different parts of the file

4. Both report success

5. Main agent verifies build passes

6. Reports to user:
   "Fixes applied:
    - X1: F1 — switched to PlacementMode.Absolute
    - X2: F3 — added _isApplyingDecorations guard
    - X3: F4 — updated PlacementRectangle in reuse path"
```

### Example 3: Review + Test Combined (1 agent)

```
User: "just review and test at a time"

Main agent:
1. Suggests dispatch:
   "I'll dispatch 1 agent for combined Review + Test:
    - Code Reviewer: review fixes + verify build"

2. User: "go"

3. Agent reviews code and runs build

4. Reports:
   "Review: PASS
    Build: PASS
    Bug found: F4 reuse path uses wrong coordinates"

5. Main agent fixes the bug

6. Re-verifies build

7. Reports to user:
   "Review complete. Found and fixed 1 issue."
```

---

## 13. Do's and Don'ts

### Do's

- **DO** read AGENTS.md before dispatching
- **DO** suggest the dispatch before doing it
- **DO** wait for user approval ("go"/"ok"/"yes")
- **DO** write specific, focused task prompts
- **DO** collect results from all agents
- **DO** never fabricate or assume results
- **DO** follow the output format rules
- **DO** verify build/tests after fixes
- **DO** write results to docs/agent-results/

### Don'ts

- **DON'T** auto-dispatch without user approval
- **DON'T** make up subagent outputs
- **DON'T** skip the suggestion step
- **DON'T** dispatch too many agents for simple tasks
- **DON'T** ignore agent results
- **DON'T** skip build verification
- **DON'T** forget to write the report
- **DON'T** mix agent results with your own analysis
- **DON'T** dispatch agents for tasks you can do yourself

### When to Use Agents

| Task | Use Agents? | Why |
|------|-------------|-----|
| Simple bug fix | No | Overkill, do it yourself |
| Complex multi-file change | Yes | Multiple perspectives needed |
| Critical bug | Yes | Need thorough analysis |
| User asks for audit | Yes | User explicitly requested |
| Code review | Yes | Multiple reviewers catch more |
| Documentation update | Maybe | Only if complex |
| Adding a comment | No | Trivial task |
| Refactoring | Yes | Need architecture perspective |

### When NOT to Use Agents

- Task is simple and straightforward
- User didn't ask for agents
- No complex interactions between components
- You can do it yourself quickly
- It's just reading a file
- It's just running a command

---

## Quick Reference

### Commands

```
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
.opencode/agent-sets-system.md → Agent sets definition (18 sets)
AGENTS.md                      → Project agent rules
docs/agent-results/            → Agent output reports
docs/AGENT-SETS-GUIDE.md       → This file
```

### Agent Output Template

```markdown
# {Task Name} — {Count} Subagent Findings

**Date:** {date}
**Issue:** {description}
**Agents dispatched:** {list}

---

## FINDING {N} (SEVERITY) — {Title}

**Location:** `{file}` — `{method}` (line ~{n})
**Agents:** {list}

{What/Where/Fix}

---

## Summary

| # | Finding | Severity | Agents |
|---|---------|----------|--------|
```
