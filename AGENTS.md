

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
  - prompt: the task + the agent's specific `"role"` description from the set JSON. Do NOT include the full agent instruction markdown file in the prompt parameter, as the subagent automatically loads it via its type/skill name.
- Dispatch read-only agents (audit/research/review sets) in parallel
- Dispatch write agents (fix/modify sets) **serially** — two agents editing the same file will conflict
- If a set has both read-only and write agents, dispatch write agents serially after read agents finish
- After all agents complete, call the plugin's `get_results` tool

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
