// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { newerGoodVersion } from "./newer-good-version.js";

describe("newerGoodVersion", () => {
  it("returns the first prepared release newer than the running version", () => {
    expect(newerGoodVersion("1.0.0")).toBe("1.1.0");
    expect(newerGoodVersion("1.1.0")).toBe("1.2.0");
  });

  it("fails when every prepared release is already installed", () => {
    expect(() => newerGoodVersion("1.3.0")).toThrow("No prepared release is newer than 1.3.0.");
  });
});
