import { type Plugin, tool } from "@opencode-ai/plugin";
import { createBridgeState } from "./agent-bridge-core";

export const AgentBridgePlugin: Plugin = async () => {
  const state = createBridgeState();

  return {
    config: async () => {},

    event: async ({ event }) => {
      state.handleEvent(event);
    },

    tool: {
      register_session: tool({
        description:
          "Register a subagent session's output path so get_results can read its findings file.",
        args: {
          sessionID: {
            description: "Subagent session ID",
            type: "string",
          },
          setID: {
            description: "Agent set ID",
            type: "string",
          },
          agentName: {
            description: "Agent name",
            type: "string",
          },
          outputPath: {
            description:
              "Output file path for this agent's findings, e.g. .opencode/agent-results/{set_id}/{agent_name}.md",
            type: "string",
          },
        },
        async execute({ sessionID, setID, agentName, outputPath }: {
          sessionID: string; setID: string; agentName: string; outputPath: string;
        }) {
          return state.handleRegisterSession({ sessionID, setID, agentName, outputPath });
        },
      }),

      get_results: tool({
        description:
          "Get compiled results from all tracked subagent sessions. Call after subagents finish to collect findings, file changes, session status, and raw output file contents.",
        args: {},
        async execute() {
          return state.handleGetResults();
        },
      }),

      clear_results: tool({
        description: "Clear all tracked session data and findings to start fresh.",
        args: {},
        async execute() {
          return state.handleClearResults();
        },
      }),
    },
  };
};
