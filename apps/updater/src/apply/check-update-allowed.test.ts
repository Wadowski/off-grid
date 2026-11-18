// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { ParsedApplyRequest } from "../types.js";
import { checkUpdateAllowed } from "./check-update-allowed.js";

const buildRequest = (
  currentVersion: string,
  targetVersion: string,
  minimumPreviousVersion: string,
): ParsedApplyRequest => ({
  currentVersion,
  manifest: {
    schemaVersion: 1,
    version: targetVersion,
    commit: "a".repeat(40),
    images: {
      server: {
        reference: `ghcr.io/offgrid/offgrid-main-server@sha256:${"a".repeat(64)}`,
        platforms: ["linux/amd64"],
      },
      web: {
        reference: `ghcr.io/offgrid/offgrid-main-web@sha256:${"b".repeat(64)}`,
        platforms: ["linux/amd64"],
      },
    },
    minimumPreviousVersion,
  },
});

describe("checkUpdateAllowed", () => {
  it("allows a newer target when the current version meets the minimum", () => {
    expect(() => checkUpdateAllowed(buildRequest("1.4.0", "1.5.0", "1.0.0"))).not.toThrow();
  });

  it("allows a current version equal to the minimum previous version", () => {
    expect(() => checkUpdateAllowed(buildRequest("1.0.0", "1.5.0", "1.0.0"))).not.toThrow();
  });

  it("refuses a current version below the minimum previous version", () => {
    expect(() => checkUpdateAllowed(buildRequest("0.9.9", "1.5.0", "1.0.0"))).toThrow(
      "current version is below the minimum previous version",
    );
  });

  it("refuses a target equal to the current version", () => {
    expect(() => checkUpdateAllowed(buildRequest("1.5.0", "1.5.0", "1.0.0"))).toThrow(
      "target version is not newer than the current version",
    );
  });

  it("refuses a target older than the current version", () => {
    expect(() => checkUpdateAllowed(buildRequest("1.5.0", "1.4.0", "1.0.0"))).toThrow(
      "target version is not newer than the current version",
    );
  });
});
