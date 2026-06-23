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
    "session.created": (input: { info: { id: string; parentID?: string; title: string; directory: string } }) => {
      const s = trackSession(input.info.id);
      s.agentName = input.info.title || null;
      s.startedAt = Date.now();
    },

    "session.status": (input: { sessionID: string; status: { type: string } }) => {
      const s = trackSession(input.sessionID);
      if (input.status.type === "busy") s.status = "running";
      if (input.status.type === "idle" && s.status === "running") {
        s.status = "completed";
        s.completedAt = Date.now();
      }
    },

    "session.error": (input: { sessionID?: string; error?: { name: string } }) => {
      if (!input.sessionID) return;
      const s = trackSession(input.sessionID);
      s.status = "error";
      s.error = input.error?.name || "Unknown error";
      s.completedAt = Date.now();
    },

    "session.diff": (input: { sessionID: string; diff: Array<{ file: string; additions: number; deletions: number }> }) => {
      const s = trackSession(input.sessionID);
      for (const d of input.diff) {
        if (!s.filesChanged.includes(d.file)) s.filesChanged.push(d.file);
      }
    },

    "session.deleted": (input: { info: { id: string } }) => {
      const s = sessions.get(input.info.id);
      if (s && s.status !== "completed" && s.status !== "error") {
        s.status = "completed";
        s.completedAt = Date.now();
      }
    },

    "session.idle": (input: { sessionID: string }) => {
      const s = sessions.get(input.sessionID);
      if (s && s.status === "running") {
        s.status = "completed";
        s.completedAt = Date.now();
      }
    },

    tool: {
      get_results: tool({
        description: "Get compiled results from all tracked subagent sessions. Call after subagents finish to collect findings, file changes, and session status.",
        args: {},
        execute: () => {
          const completed = [...sessions.values()];
          const summary = {
            totalAgents: completed.length,
            completed: completed.filter((s) => s.status === "completed").length,
            errors: completed.filter((s) => s.status === "error").length,
            totalFilesChanged: [...new Set(completed.flatMap((s) => s.filesChanged))].length,
          };

          return {
            summary,
            sessions: completed.map((s) => ({
              id: s.id,
              agentName: s.agentName,
              status: s.status,
              error: s.error,
              filesChanged: s.filesChanged,
              duration: s.startedAt && s.completedAt ? s.completedAt - s.startedAt : null,
            })),
            findings,
          };
        },
      }),

      clear_results: tool({
        description: "Clear all tracked session data and findings to start fresh.",
        args: {},
        execute: () => {
          sessions.clear();
          findings.length = 0;
          return { cleared: true };
        },
      }),
    },
  };
};
