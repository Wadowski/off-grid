// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createRunLock } from "./create-run-lock.js";

describe("createRunLock", () => {
  it("refuses a second acquire while the first is held", () => {
    const lock = createRunLock();

    expect(lock.tryAcquire()).not.toBeNull();
    expect(lock.tryAcquire()).toBeNull();
  });

  it("accepts an acquire again after release", () => {
    const lock = createRunLock();
    const release = lock.tryAcquire();

    release?.();

    expect(lock.tryAcquire()).not.toBeNull();
  });
});
