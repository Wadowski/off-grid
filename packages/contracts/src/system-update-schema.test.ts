// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemUpdateSchema } from "./system-update-schema.js";

const buildUpdate = () => ({
  currentVersion: "1.4.0",
  latestVersion: "1.5.0",
  updateAvailable: true,
  updateAllowed: true,
  checkedAt: "2026-11-17T19:45:00.000Z",
  runState: "idle",
  lastRun: null,
  running: false,
  nightlyEnabled: false,
});

describe("systemUpdateSchema", () => {
  it("accepts an update overview before any check", () => {
    const overview = { ...buildUpdate(), latestVersion: null, checkedAt: null };

    expect(systemUpdateSchema.parse(overview)).toEqual(overview);
  });

  it("accepts a run state of interrupted", () => {
    expect(
      systemUpdateSchema.safeParse({ ...buildUpdate(), runState: "interrupted" }).success,
    ).toBe(true);
  });

  it("rejects an unknown run state", () => {
    expect(systemUpdateSchema.safeParse({ ...buildUpdate(), runState: "exploded" }).success).toBe(
      false,
    );
  });

  it("rejects a latest version that is not a release version", () => {
    expect(systemUpdateSchema.safeParse({ ...buildUpdate(), latestVersion: "v1.5" }).success).toBe(
      false,
    );
  });

  it("rejects keys beyond the published fields", () => {
    expect(systemUpdateSchema.safeParse({ ...buildUpdate(), updaterUrl: "x" }).success).toBe(false);
  });
});
