# Agent Dispatch Rules

## Permission
- NEVER auto-dispatch subagents. Always describe the set and ask: "Shall I dispatch [set name] ([N] agents)?"
- Wait for explicit user approval before dispatching

## Available Sets
- 18 sets available in C:/Users/hruth/OneDrive/Desktop/openocde-plugin/sets/
- Each set JSON has: id, name, category, description, agents[], outputPattern

## Dispatch (V1)
- Find the matching set by ID in C:/Users/hruth/OneDrive/Desktop/openocde-plugin/sets/
- For each agent in the set's agents array, call the `task` tool with:
  - description: agent.name
  - subagent_type: agent.agent_type
  - prompt: the task + agent-specific instructions
- Dispatch agents in parallel using the set's outputPattern format
- After all agents complete, call the plugin's `get_results` tool

## Output Format
- Each result must have: source set, agent name, finding, evidence
- Compile into a structured report grouped by agent

## Writing Rules
- Use concise bullet points for findings
- Evidence paths: file:line format
- No commentary or editorializing in agent output
