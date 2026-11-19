// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { updateStatusSchema } from "@offgrid/contracts";
import { createSilentLogger } from "../../test/silent-logger.js";
import { waitUntil } from "../../test/wait-until.js";
import type { UpdateStatus } from "../types.js";
import { runInBackground } from "./run-in-background.js";

const succeededStatus = (): UpdateStatus =>
  updateStatusSchema.parse({
    runId: "2b1f0c2e-6a4e-4f7b-9a8e-1c2d3e4f5a6b",
    currentVersion: "1.2.3",
    targetVersion: "1.2.4",
    startedAt: "2026-11-18T10:00:00.000Z",
    finishedAt: "2026-11-18T10:05:00.000Z",
    outcome: "succeeded",
    failedStep: null,
    steps: [],
    backupName: "offgrid-1.2.3-20261118T100000Z",
    previousImages: null,
    writesAfterBackupLost: false,
    message: "Update finished and the new version is healthy.",
  });

describe("runInBackground", () => {
  it("releases the run lock after the job succeeds", async () => {
    let released = false;
    const job = async (): Promise<UpdateStatus> => succeededStatus();

    runInBackground(createSilentLogger(), () => (released = true), job);
    await waitUntil(() => released);

    expect(released).toBe(true);
  });

  it("releases the run lock after the job throws", async () => {
    let released = false;
    const job = async (): Promise<UpdateStatus> => {
      throw new Error("docker socket closed");
    };

    runInBackground(createSilentLogger(), () => (released = true), job);
    await waitUntil(() => released);

    expect(released).toBe(true);
  });
});
