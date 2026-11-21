// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { reconnectDelay } from "./reconnect-delay.js";

const NO_JITTER_MIN = () => 0;
const NO_JITTER_MAX = () => 1;

describe("reconnectDelay", () => {
  it("keeps the first attempt between half and all of one second", () => {
    expect(reconnectDelay(0, NO_JITTER_MIN)).toBe(500);
    expect(reconnectDelay(0, NO_JITTER_MAX)).toBe(1000);
  });

  it("doubles the cap on each attempt", () => {
    expect(reconnectDelay(1, NO_JITTER_MAX)).toBe(2000);
    expect(reconnectDelay(2, NO_JITTER_MAX)).toBe(4000);
    expect(reconnectDelay(4, NO_JITTER_MAX)).toBe(16000);
  });

  it("caps the delay at 30 seconds", () => {
    expect(reconnectDelay(5, NO_JITTER_MAX)).toBe(30000);
    expect(reconnectDelay(50, NO_JITTER_MAX)).toBe(30000);
    expect(reconnectDelay(5000, NO_JITTER_MIN)).toBe(15000);
  });

  it("stays within the jitter band for a random value between the bounds", () => {
    const delay = reconnectDelay(3, () => 0.5);
    expect(delay).toBe(6000);
  });
});
