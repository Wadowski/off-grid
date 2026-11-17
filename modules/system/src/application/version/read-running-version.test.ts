// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { readRunningVersion } from "./read-running-version.js";

describe("readRunningVersion", () => {
  it("omits the commit when none is configured", () => {
    const body = readRunningVersion({ version: "1.2.3" });

    expect(body).toStrictEqual({ version: "1.2.3" });
    expect(JSON.stringify(body)).not.toContain("commit");
  });

  it("includes the commit when one is configured", () => {
    expect(readRunningVersion({ version: "1.2.3", commit: "abc1234" })).toStrictEqual({
      version: "1.2.3",
      commit: "abc1234",
    });
  });
});
