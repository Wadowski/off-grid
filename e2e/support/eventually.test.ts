// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventually } from "./eventually.js";

describe("eventually", () => {
  it("returns the value of an assertion that passes on the first try", async () => {
    await expect(eventually(() => "ready")).resolves.toBe("ready");
  });

  it("retries until the assertion passes", async () => {
    let attempts = 0;
    const result = await eventually(
      () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("not yet");
        }
        return attempts;
      },
      { interval: 1 },
    );
    expect(result).toBe(3);
  });

  it("rethrows the last failure once the timeout ends", async () => {
    await expect(
      eventually(
        () => {
          throw new Error("never ready");
        },
        { timeout: 20, interval: 5 },
      ),
    ).rejects.toThrow("never ready");
  });
});
