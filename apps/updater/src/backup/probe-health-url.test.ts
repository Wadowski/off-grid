// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { probeHealthUrl } from "./probe-health-url.js";

const fetchStatus = (status: number): typeof fetch =>
  (async () => new Response(null, { status })) as typeof fetch;

describe("probeHealthUrl", () => {
  it("reports healthy for a 2xx response", async () => {
    expect(await probeHealthUrl(fetchStatus(200), "http://127.0.0.1:3000/health")).toBe(true);
  });

  it("reports unhealthy for a non-2xx response", async () => {
    expect(await probeHealthUrl(fetchStatus(503), "http://127.0.0.1:3000/health")).toBe(false);
  });

  it("reports unhealthy when the server cannot be reached", async () => {
    const unreachable = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;

    expect(await probeHealthUrl(unreachable, "http://127.0.0.1:3000/health")).toBe(false);
  });
});
