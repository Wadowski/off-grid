// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemUpdateCheckSchema } from "./system-update-check-schema.js";

const buildCheck = () => ({
  currentVersion: "1.4.0",
  latestVersion: "1.5.0",
  updateAvailable: true,
  updateAllowed: true,
});

describe("systemUpdateCheckSchema", () => {
  it("accepts a stored check with its time", () => {
    const check = { ...buildCheck(), checkedAt: "2026-11-17T19:45:00.000Z" };

    expect(systemUpdateCheckSchema.parse(check)).toEqual(check);
  });

  it("rejects a check without a time", () => {
    expect(systemUpdateCheckSchema.safeParse(buildCheck()).success).toBe(false);
  });
});
