// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, describe, expect, it } from "vitest";
import { runCommand } from "./run-command.js";

const MARKER_DIR_ENV = "RUN_COMMAND_TEST_MARKER_DIR";
const READY_MARKER = "ready";
const TERM_MARKER = "term";
const MARKER_TIMEOUT_MS = 10_000;
const MARKER_POLL_MS = 10;

const markerWriter = `const { writeFileSync } = require("node:fs"); const dir = process.env.${MARKER_DIR_ENV};`;
const runUntilKilled = "setInterval(() => {}, 1000);";
const listensForSigterm = `${markerWriter}
process.on("SIGTERM", () => writeFileSync(dir + "/${TERM_MARKER}", ""));
writeFileSync(dir + "/${READY_MARKER}", "");
${runUntilKilled}`;
const exitsOnSigterm = `${markerWriter}
writeFileSync(dir + "/${READY_MARKER}", "");
${runUntilKilled}`;

const directories: string[] = [];

const waitForMarker = async (path: string): Promise<void> => {
  const deadline = Date.now() + MARKER_TIMEOUT_MS;
  while (!existsSync(path)) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for ${path}`);
    }
    await delay(MARKER_POLL_MS);
  }
};

const startChild = async (script: string) => {
  const markerDirectory = await mkdtemp(join(tmpdir(), "run-command-test-"));
  directories.push(markerDirectory);
  const running = runCommand(process.execPath, ["-e", script], {
    ...process.env,
    [MARKER_DIR_ENV]: markerDirectory,
  });
  await waitForMarker(join(markerDirectory, READY_MARKER));
  return { running, markerDirectory };
};

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("runCommand", () => {
  it("resolves with the exit code of the child", async () => {
    await expect(
      runCommand(process.execPath, ["-e", "process.exit(3)"], process.env),
    ).resolves.toBe(3);
  });

  it("forwards SIGTERM to the child and resolves with its signal exit code", async () => {
    const { running } = await startChild(exitsOnSigterm);
    process.emit("SIGTERM");
    await expect(running).resolves.toBe(128 + 15);
  });

  it("escalates to SIGKILL when a second signal arrives and the child ignores SIGTERM", async () => {
    const { running, markerDirectory } = await startChild(listensForSigterm);
    process.emit("SIGTERM");
    await waitForMarker(join(markerDirectory, TERM_MARKER));
    process.emit("SIGTERM");
    await expect(running).resolves.toBe(128 + 9);
  });
});
