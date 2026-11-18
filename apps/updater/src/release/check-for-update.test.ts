// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { ReleaseManifest } from "../types.js";
import { checkForUpdate } from "./check-for-update.js";

const digest = (character: string): string => character.repeat(64);

const releaseManifest = (version: string, minimumPreviousVersion: string): ReleaseManifest => ({
  schemaVersion: 1,
  version,
  commit: "b".repeat(40),
  images: {
    server: {
      reference: `ghcr.io/owner/offgrid-main-server@sha256:${digest("a")}`,
      platforms: ["linux/amd64"],
    },
    web: {
      reference: `ghcr.io/owner/offgrid-main-web@sha256:${digest("c")}`,
      platforms: ["linux/amd64"],
    },
  },
  minimumPreviousVersion,
});

describe("checkForUpdate", () => {
  it("reports a newer release as available and allowed from a supported version", () => {
    expect(checkForUpdate("1.1.0", releaseManifest("1.2.0", "1.0.0"))).toEqual({
      currentVersion: "1.1.0",
      latestVersion: "1.2.0",
      updateAvailable: true,
      updateAllowed: true,
    });
  });

  it("reports the same version as not available", () => {
    expect(checkForUpdate("1.2.0", releaseManifest("1.2.0", "1.0.0"))).toMatchObject({
      updateAvailable: false,
    });
  });

  it("reports an update as not allowed below the minimum previous version", () => {
    expect(checkForUpdate("0.9.0", releaseManifest("1.2.0", "1.0.0"))).toMatchObject({
      updateAvailable: true,
      updateAllowed: false,
    });
  });
});
