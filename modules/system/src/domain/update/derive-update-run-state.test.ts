// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { UpdateStatus } from "../../types.js";
import { deriveUpdateRunState } from "./derive-update-run-state.js";

const statusWithOutcome = (outcome: UpdateStatus["outcome"]): UpdateStatus => ({
  runId: "3f1c2a4e-6b7d-4e8f-9a0b-1c2d3e4f5a6b",
  currentVersion: "1.0.0",
  targetVersion: "1.1.0",
  startedAt: "2026-11-19T10:00:00.000Z",
  finishedAt: null,
  outcome,
  failedStep: null,
  steps: [],
  backupName: null,
  previousImages: null,
  writesAfterBackupLost: false,
  message: "status",
});

describe("deriveUpdateRunState", () => {
  it("reports idle when no run is recorded and none is active", () => {
    expect(deriveUpdateRunState(null, false)).toBe("idle");
  });

  it("reports running whenever the updater holds its lock", () => {
    expect(deriveUpdateRunState(null, true)).toBe("running");
    expect(deriveUpdateRunState(statusWithOutcome("in_progress"), true)).toBe("running");
  });

  it("reports interrupted when a run is still in progress but nothing is running", () => {
    expect(deriveUpdateRunState(statusWithOutcome("in_progress"), false)).toBe("interrupted");
  });

  it("maps each finished outcome to its run state", () => {
    expect(deriveUpdateRunState(statusWithOutcome("succeeded"), false)).toBe("succeeded");
    expect(deriveUpdateRunState(statusWithOutcome("rolled_back"), false)).toBe("rolled_back");
    expect(deriveUpdateRunState(statusWithOutcome("failed_needs_admin"), false)).toBe(
      "needs_admin",
    );
    expect(deriveUpdateRunState(statusWithOutcome("refused"), false)).toBe("failed");
    expect(deriveUpdateRunState(statusWithOutcome("failed_before_change"), false)).toBe("failed");
  });
});
