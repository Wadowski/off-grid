// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { attemptEach } from "./attempt-each.js";

describe("attemptEach", () => {
  it("runs the action for each id and returns none failed when all succeed", async () => {
    const action = vi.fn(async () => undefined);

    expect(await attemptEach(["ben", "cara"], action)).toEqual([]);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("keeps going after a failure and returns the ids that failed", async () => {
    const action = vi.fn(async (userId: string) => {
      if (userId === "ben") {
        throw new Error("down");
      }
    });

    expect(await attemptEach(["ben", "cara"], action)).toEqual(["ben"]);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
