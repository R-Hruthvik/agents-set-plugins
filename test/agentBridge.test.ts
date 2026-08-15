import fs from "fs";
import path from "path";
import os from "os";
import assert from "assert/strict";
import { it, before, after } from "node:test";
import { createBridgeState } from "../plugins/agent-bridge-core";

let tmpDir: string;
let outFile: string;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ab-"));
  outFile = path.join(tmpDir, "code-reviewer.md");
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

it("handleRegisterSession stores metadata and output path", async () => {
  const state = createBridgeState();
  const res = await state.handleRegisterSession({
    sessionID: "s1",
    setID: "code-audit",
    agentName: "Code Reviewer",
    outputPath: outFile,
  });
  assert.equal(res.output, `Registered Code Reviewer -> ${outFile}`);
  const s = state.sessions.get("s1");
  assert.ok(s);
  assert.equal(s.agentName, "Code Reviewer");
  assert.equal(s.setID, "code-audit");
  assert.equal(s.outputPath, outFile);
});

it("handleGetResults reads output file and includes raw findings", async () => {
  const state = createBridgeState();
  await state.handleRegisterSession({
    sessionID: "s1",
    setID: "code-audit",
    agentName: "Code Reviewer",
    outputPath: outFile,
  });
  fs.writeFileSync(outFile, "# Findings\n- Issue at src/foo.js:1\n", "utf8");
  const results = JSON.parse((await state.handleGetResults()).output);
  const finding = results.findings.find((f: { sessionID: string }) => f.sessionID === "s1");
  assert.ok(finding);
  assert.ok(finding.rawOutputText);
  assert.ok(finding.rawOutputText.includes("src/foo.js:1"));
  assert.equal(results.summary.findingsWithOutput, 1);
  assert.equal(results.summary.findingsMissingOutput, 0);
});

it("handleGetResults handles missing output file gracefully", async () => {
  const state = createBridgeState();
  await state.handleRegisterSession({
    sessionID: "s2",
    setID: "code-audit",
    agentName: "Code Reviewer",
    outputPath: path.join(tmpDir, "missing.md"),
  });
  const results = JSON.parse((await state.handleGetResults()).output);
  const finding = results.findings.find((f: { sessionID: string }) => f.sessionID === "s2");
  assert.ok(finding);
  assert.equal(finding.rawOutputText, null);
  assert.equal(finding.severity, "high");
  assert.equal(results.summary.findingsMissingOutput, 1);
});

it("handleClearResults clears sessions and findings", async () => {
  const state = createBridgeState();
  await state.handleRegisterSession({
    sessionID: "s3",
    setID: "code-audit",
    agentName: "Code Reviewer",
    outputPath: outFile,
  });
  await state.handleClearResults();
  const results = JSON.parse((await state.handleGetResults()).output);
  assert.equal(results.sessions.length, 0);
  assert.equal(results.findings.length, 0);
});

it("AgentBridgePlugin factory returns valid hooks object with config, event, and tool", async () => {
  const { AgentBridgePlugin } = await import("../plugins/agent-bridge");
  // @ts-ignore
  const pluginInstance = await AgentBridgePlugin({});
  assert.equal(typeof pluginInstance.config, "function");
  assert.equal(typeof pluginInstance.event, "function");
  assert.equal(typeof pluginInstance.tool, "object");
});


