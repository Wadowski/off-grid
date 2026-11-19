// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdaterCheck, UpdateStatus } from "../src/types.js";

export const ADMIN_USER_ID = "admin-user";

export const MEMBER_USER_ID = "member-user";

export const updateStatusFixture = (outcome: UpdateStatus["outcome"]): UpdateStatus => ({
  runId: "3f1c2a4e-6b7d-4e8f-9a0b-1c2d3e4f5a6b",
  currentVersion: "1.2.3",
  targetVersion: "1.3.0",
  startedAt: "2026-11-19T10:00:00.000Z",
  finishedAt: outcome === "in_progress" ? null : "2026-11-19T10:05:00.000Z",
  outcome,
  failedStep: null,
  steps: [],
  backupName: null,
  previousImages: null,
  writesAfterBackupLost: false,
  message: "Update status",
});

export const updaterCheckFixture = (overrides: Partial<UpdaterCheck> = {}): UpdaterCheck => ({
  currentVersion: "1.2.3",
  latestVersion: "1.3.0",
  updateAvailable: true,
  updateAllowed: true,
  ...overrides,
});

export const idleStatusReply = { update: null, running: false };
