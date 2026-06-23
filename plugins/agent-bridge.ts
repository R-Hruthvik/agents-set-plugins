import { type Plugin, tool } from "@opencode-ai/plugin";

interface Finding {
  agentName: string;
  sessionID: string;
  setID: string | null;
  finding: string;
  severity: "low" | "medium" | "high" | "critical";
  evidencePaths: string[];
  filesChanged: string[];
}

interface TrackedSession {
  id: string;
  agentName: string | null;
  setID: string | null;
  status: "pending" | "running" | "completed" | "error";
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
  filesChanged: string[];
}

export const AgentBridgePlugin: Plugin = async () => {
  const sessions = new Map<string, TrackedSession>();
  const findings: Finding[] = [];

  function trackSession(id: string): TrackedSession {
    if (!sessions.has(id)) {
      sessions.set(id, {
        id,
        agentName: null,
        setID: null,
        status: "pending",
        error: null,
        startedAt: null,
        completedAt: null,
        filesChanged: [],
      });
    }
    return sessions.get(id)!;
  }

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "session.created": {
          const s = trackSession(event.properties.info.id);
          s.agentName = event.properties.info.title || null;
          s.startedAt = Date.now();
          break;
        }
        case "session.status": {
          const s = trackSession(event.properties.sessionID);
          if (event.properties.status.type === "idle") {
            s.status = "completed";
            s.completedAt = Date.now();
          }
          break;
        }
        case "session.error": {
          if (!event.properties.sessionID) break;
          const s = trackSession(event.properties.sessionID);
          s.status = "error";
          s.error = event.properties.error?.type || "Unknown error";
          s.completedAt = Date.now();
          break;
        }
        case "session.diff": {
          const s = trackSession(event.properties.sessionID);
          for (const d of event.properties.diff) {
            if (!s.filesChanged.includes(d.file)) s.filesChanged.push(d.file);
          }
          break;
        }
        case "session.deleted": {
          const s = sessions.get(event.properties.info.id);
          if (s && s.status !== "completed" && s.status !== "error") {
            s.status = "completed";
            s.completedAt = Date.now();
          }
          break;
        }
        case "session.idle": {
          const s = sessions.get(event.properties.sessionID);
          if (s && s.status === "running") {
            s.status = "completed";
            s.completedAt = Date.now();
          }
          break;
        }
      }
    },

    tool: {
      get_results: tool({
        description: "Get compiled results from all tracked subagent sessions. Call after subagents finish to collect findings, file changes, and session status.",
        args: {},
        async execute() {
          const completed = [...sessions.values()];
          const out = JSON.stringify({
            summary: {
              totalAgents: completed.length,
              completed: completed.filter((s) => s.status === "completed").length,
              errors: completed.filter((s) => s.status === "error").length,
              totalFilesChanged: [...new Set(completed.flatMap((s) => s.filesChanged))].length,
            },
            sessions: completed.map((s) => ({
              id: s.id,
              agentName: s.agentName,
              status: s.status,
              error: s.error,
              filesChanged: s.filesChanged,
              duration: s.startedAt && s.completedAt ? s.completedAt - s.startedAt : null,
            })),
            findings,
          }, null, 2);

          return { output: out };
        },
      }),

      clear_results: tool({
        description: "Clear all tracked session data and findings to start fresh.",
        args: {},
        async execute() {
          sessions.clear();
          findings.length = 0;
          return { output: "Cleared" };
        },
      }),
    },
  };
};
