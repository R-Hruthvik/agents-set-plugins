

# Agent Dispatch Rules

## Trigger & Usage
- When the user asks to analyze, audit, review, debug, or fix issues (or explicitly mentions "agents-sets"), you MUST look up the available agent sets under `/home/hruthvik9487/Documents/agents/agents-set-plugins/.opencode/agents-sets/` first.
- Do NOT perform the fixes or audits directly yourself. Instead, identify the appropriate agent set, describe it to the user, and ask for permission to dispatch it.

## Permission
- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"
- Wait for explicit user approval before dispatching

## Available Sets
- Sets installed in `/home/hruthvik9487/Documents/agents/agents-set-plugins/.opencode/agents-sets/`
- Each set JSON file has: id, name, category, description, agents[], outputPattern

## Dispatch (V1)
- Find the matching set JSON file by ID in `/home/hruthvik9487/Documents/agents/agents-set-plugins/.opencode/agents-sets/`
- For each agent in the set's agents array, call the `task` tool (or `invoke_subagent`) with:
  - description: agent.name
  - subagent_type: agent.file.replace('.md', '')
  - prompt: Combine all of the following in this exact order:
    1. Restate the task clearly.
    2. Inject the agent's behavioral rules from `agents/<agent.file>` verbatim (identity, role constraints, process steps, output rules).
    3. Provide the exact persistent output file path for this run: `.opencode/agent-results/{set_id}/{agent_name}.md`.
    4. Mandate: "Write your raw findings, evidence in `file:line` format, and any affected file paths directly to the output file before finishing. Do not rely solely on chat output."
    5. Restate the required final output format: source set, agent name, finding, evidence.
- Dispatch read-only agents (audit/research/review sets) in parallel
- Dispatch write agents (fix/modify sets) **serially** — two agents editing the same file will conflict
- If a set has both read-only and write agents, dispatch write agents serially after read agents finish
- After all agents complete, call the plugin's `get_results` tool

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent
- Every agent MUST write findings to `.opencode/agent-results/{set_id}/{agent_name}.md` before completing. The parent agent must read these files and compile the final report from them.

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
- Agents must preserve all raw output, even minor findings, into their output file to prevent data loss during summarization
