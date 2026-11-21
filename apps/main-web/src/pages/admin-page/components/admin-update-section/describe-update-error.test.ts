// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { describeUpdateError } from "./describe-update-error.js";

describe("describeUpdateError", () => {
  it.each([
    ["NO_UPDATE_AVAILABLE", "admin.update.errors.noUpdateAvailable"],
    ["UPDATE_NOT_ALLOWED", "admin.update.errors.updateNotAllowed"],
    ["UPDATE_ALREADY_RUNNING", "admin.update.errors.alreadyRunning"],
    ["UPDATER_UNAVAILABLE", "admin.update.errors.updaterUnavailable"],
    ["RELEASE_SOURCE_UNREACHABLE", "admin.update.errors.releaseSourceUnreachable"],
    ["CURRENT_VERSION_UNKNOWN", "admin.update.errors.currentVersionUnknown"],
  ])("maps the %s code to its fixed text", (code, textId) => {
    expect(describeUpdateError(new ApiError(409, code, "server text"))).toBe(textId);
  });

  it("maps an unknown code to the generic text without showing the server message", () => {
    expect(describeUpdateError(new ApiError(500, "SOMETHING_ELSE", "raw server text"))).toBe(
      "admin.update.errors.generic",
    );
  });

  it("maps a non-API failure to the generic text", () => {
    expect(describeUpdateError(new Error("network down"))).toBe("admin.update.errors.generic");
  });
});
