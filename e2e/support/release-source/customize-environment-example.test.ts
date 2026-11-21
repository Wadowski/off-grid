// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { customizeEnvironmentExample } from "./customize-environment-example.js";

describe("customizeEnvironmentExample", () => {
  it("points ports, owner and repository at the fake release source and keeps other lines", () => {
    const text = customizeEnvironmentExample(
      "OFFGRID_VERSION=\nOFFGRID_IMAGE_OWNER=wadowski\nOFFGRID_WEB_PORT=8080\nTZ=UTC\n",
    );

    expect(text).toContain("OFFGRID_VERSION=\n");
    expect(text).toContain("OFFGRID_IMAGE_OWNER=offgrid-e2e");
    expect(text).toContain("OFFGRID_WEB_PORT=18080");
    expect(text).toContain("TZ=UTC");
  });
});
