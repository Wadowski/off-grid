// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { runCommand } from "./run-command.js";

const nodeWith = (script: string): [string, string[]] => [process.execPath, ["-e", script]];

describe("runCommand", () => {
  it("resolves with the exit code of the child", async () => {
    await expect(runCommand(...nodeWith("process.exit(3)"), process.env)).resolves.toBe(3);
  });

  it("forwards SIGTERM to the child and resolves with its signal exit code", async () => {
    const running = runCommand(...nodeWith("setInterval(() => {}, 1000)"), process.env);
    setTimeout(() => process.emit("SIGTERM"), 500);
    await expect(running).resolves.toBe(128 + 15);
  });
});
