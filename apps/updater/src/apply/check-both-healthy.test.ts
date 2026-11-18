// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { checkBothHealthy } from "./check-both-healthy.js";

const probe = (healthy: boolean) => async () => healthy;

describe("checkBothHealthy", () => {
  it("is healthy when the server and the web app are healthy", async () => {
    expect(await checkBothHealthy({ server: probe(true), web: probe(true) })()).toBe(true);
  });

  it("is unhealthy when the server is unhealthy", async () => {
    expect(await checkBothHealthy({ server: probe(false), web: probe(true) })()).toBe(false);
  });

  it("is unhealthy when the web app is unhealthy", async () => {
    expect(await checkBothHealthy({ server: probe(true), web: probe(false) })()).toBe(false);
  });
});
