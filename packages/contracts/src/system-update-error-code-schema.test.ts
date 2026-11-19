// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemUpdateErrorCodeSchema } from "./system-update-error-code-schema.js";

describe("systemUpdateErrorCodeSchema", () => {
  it("accepts every update error code the API answers with", () => {
    for (const code of [
      "ACCESS_DENIED",
      "UPDATER_UNAVAILABLE",
      "UPDATER_ERROR",
      "RELEASE_SOURCE_UNREACHABLE",
      "CURRENT_VERSION_UNKNOWN",
      "UPDATE_ALREADY_RUNNING",
      "NO_UPDATE_AVAILABLE",
      "UPDATE_NOT_ALLOWED",
    ]) {
      expect(systemUpdateErrorCodeSchema.parse(code)).toBe(code);
    }
  });

  it("rejects a code the API does not answer with", () => {
    expect(systemUpdateErrorCodeSchema.safeParse("FORBIDDEN").success).toBe(false);
  });
});
