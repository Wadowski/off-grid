// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { newComposeProjectName, waitForReady } from "./stack.js";

function responses(...statuses: (number | Error)[]): typeof fetch {
  const queue = [...statuses];
  return (async () => {
    const next = queue.shift();
    if (next === undefined) {
      throw new Error("no more responses");
    }
    if (next instanceof Error) {
      throw next;
    }
    return new Response(null, { status: next });
  }) as typeof fetch;
}

describe("newComposeProjectName", () => {
  it("gives each run its own project name", () => {
    const first = newComposeProjectName();
    const second = newComposeProjectName();
    expect(first).toMatch(/^offgrid-e2e-[0-9a-f]{8}$/);
    expect(first).not.toBe(second);
  });
});

describe("waitForReady", () => {
  it("resolves once the readiness endpoint returns 200", async () => {
    await expect(
      waitForReady("http://127.0.0.1:3000", {
        intervalMs: 1,
        fetchImpl: responses(503, new Error("connection refused"), 200),
      }),
    ).resolves.toBeUndefined();
  });

  it("asks the readiness path of the base URL", async () => {
    const requested: string[] = [];
    const fetchImpl = (async (url: string | URL | Request) => {
      requested.push(String(url));
      return new Response(null, { status: 200 });
    }) as typeof fetch;
    await waitForReady("http://127.0.0.1:3000", { fetchImpl });
    expect(requested).toEqual(["http://127.0.0.1:3000/api/health/ready"]);
  });

  it("fails with the last problem once the timeout ends", async () => {
    const alwaysUnavailable = (async () => new Response(null, { status: 503 })) as typeof fetch;
    await expect(
      waitForReady("http://127.0.0.1:3000", {
        timeoutMs: 20,
        intervalMs: 5,
        fetchImpl: alwaysUnavailable,
      }),
    ).rejects.toThrow(
      "Stack not ready at http://127.0.0.1:3000/api/health/ready after 20 ms (last: status 503).",
    );
  });
});
