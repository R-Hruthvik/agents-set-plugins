# Agent Dispatch Rules

## Trigger & Usage
- When the user asks to analyze, audit, review, debug, or fix issues (or explicitly mentions "agents-sets"), you MUST look up the available agent sets under `/home/hruthvik9487/work/handshake/project dynamo/.opencode/agents-sets/` first.
- Do NOT perform the fixes or audits directly yourself. Instead, identify the appropriate agent set, describe it to the user, and ask for permission to dispatch it.

## Permission
- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"
- Wait for explicit user approval before dispatching

## Available Agent Sets
- Sets installed in `/home/hruthvik9487/work/handshake/project dynamo/.opencode/agents-sets/`
- Installed set IDs: bug-fix
- Each set JSON file has: id, name, category, description, agents[], outputPattern

## Dispatch Rules
- Find the matching set JSON file by ID in `/home/hruthvik9487/work/handshake/project dynamo/.opencode/agents-sets/`
- Read each agent's `"permission"` field from the set JSON (`"read"` or `"write"`)
- For each agent in the set's agents array, dispatch subagents with:
  - description: agent.name
  - subagent_type: agent.file.replace('.md', '')
  - prompt: the task + the agent's specific `"role"` description from the set JSON. Do NOT include the full agent instruction markdown file in the prompt parameter, as the subagent automatically loads it via its type/skill name.
- Dispatch read-only agents (`"permission": "read"`) in parallel
- Dispatch write agents (`"permission": "write"`) **serially** — two agents editing the same file will conflict
- If a set has both read-only and write agents, dispatch write agents serially AFTER all read agents finish
- NEVER dispatch more than one agent set at a time — complete one set fully before starting another
- After all agents in a set complete, compile the results before proceeding

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
