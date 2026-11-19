// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { FORWARD_STEP_NAMES } from "./constants.js";
import { updateStatusSchema } from "./system-update-status-schema.js";

const RUN_ID = "0b6f5a3e-2d4c-4f1a-9a8b-7c6d5e4f3a21";
const STARTED_AT = "2026-11-17T19:45:00.000Z";
const SERVER_DIGEST_REFERENCE = `ghcr.io/offgrid/offgrid-main-server@sha256:${"a".repeat(64)}`;
const WEB_DIGEST_REFERENCE = `ghcr.io/offgrid/offgrid-main-web@sha256:${"b".repeat(64)}`;

const buildStatus = () => ({
  runId: RUN_ID,
  currentVersion: "1.4.0",
  targetVersion: "1.5.0",
  startedAt: STARTED_AT,
  finishedAt: null,
  outcome: "in_progress",
  failedStep: null,
  steps: FORWARD_STEP_NAMES.map((name) => ({
    name,
    state: "pending",
    startedAt: null,
    finishedAt: null,
  })),
  backupName: null,
  previousImages: { server: SERVER_DIGEST_REFERENCE, web: WEB_DIGEST_REFERENCE },
  writesAfterBackupLost: false,
  message: "Update is running.",
});

describe("updateStatusSchema", () => {
  it("accepts a status that carries previous image references", () => {
    const status = buildStatus();

    expect(updateStatusSchema.parse(status)).toEqual(status);
  });

  it("accepts a status before any previous image is known", () => {
    expect(updateStatusSchema.safeParse({ ...buildStatus(), previousImages: null }).success).toBe(
      true,
    );
  });

  it("rejects an unknown outcome", () => {
    expect(updateStatusSchema.safeParse({ ...buildStatus(), outcome: "exploded" }).success).toBe(
      false,
    );
  });

  it("rejects an unknown step name", () => {
    const steps = [{ name: "reboot", state: "pending", startedAt: null, finishedAt: null }];

    expect(updateStatusSchema.safeParse({ ...buildStatus(), steps }).success).toBe(false);
  });

  it("rejects an image reference that is not pinned by digest", () => {
    const status = {
      ...buildStatus(),
      previousImages: {
        server: "ghcr.io/offgrid/offgrid-main-server:latest",
        web: WEB_DIGEST_REFERENCE,
      },
    };

    expect(updateStatusSchema.safeParse(status).success).toBe(false);
  });

  it("rejects a version that is not a release version", () => {
    expect(updateStatusSchema.safeParse({ ...buildStatus(), targetVersion: "v1.5" }).success).toBe(
      false,
    );
  });

  it("rejects unexpected keys so that no extra data is stored", () => {
    expect(updateStatusSchema.safeParse({ ...buildStatus(), password: "not-stored" }).success).toBe(
      false,
    );
  });
});
