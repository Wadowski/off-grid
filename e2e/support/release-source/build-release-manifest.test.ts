// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { releaseManifestSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { buildReleaseManifest } from "./build-release-manifest.js";

const digest = (character: string): string => `sha256:${character.repeat(64)}`;

describe("buildReleaseManifest", () => {
  it("writes a manifest that the release schema accepts, with ghcr references by digest", () => {
    const manifest = releaseManifestSchema.parse(
      JSON.parse(
        buildReleaseManifest("1.1.0", {
          server: digest("a"),
          web: digest("b"),
          updater: digest("c"),
        }),
      ),
    );

    expect(manifest.version).toBe("1.1.0");
    expect(manifest.images.server.reference).toBe(
      `ghcr.io/offgrid-e2e/offgrid-main-server@${digest("a")}`,
    );
    expect(manifest.images.web.reference).toBe(
      `ghcr.io/offgrid-e2e/offgrid-main-web@${digest("b")}`,
    );
  });
});
