// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createServer, type AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import {
  isPortFree,
  isRunProject,
  newComposeProjectName,
  parseContainerProjects,
  waitForReady,
} from "./stack.js";

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

describe("isRunProject", () => {
  it("accepts only the random names that test runs create", () => {
    expect(isRunProject("offgrid-e2e-1a2b3c4d")).toBe(true);
    expect(isRunProject("offgrid-e2e-local")).toBe(false);
    expect(isRunProject("offgrid-e2e-1a2b3c4d-extra")).toBe(false);
  });
});

describe("parseContainerProjects", () => {
  it("returns each project once with its working directory", () => {
    const output = [
      "offgrid-e2e-1a2b3c4d\t/repo/infra/compose",
      "offgrid-e2e-1a2b3c4d\t/repo/infra/compose",
      "offgrid-e2e-9f8e7d6c\t/other/infra/compose",
      "",
    ].join("\n");
    expect(parseContainerProjects(output)).toEqual([
      { project: "offgrid-e2e-1a2b3c4d", workingDir: "/repo/infra/compose" },
      { project: "offgrid-e2e-9f8e7d6c", workingDir: "/other/infra/compose" },
    ]);
  });

  it("skips lines without a working directory label", () => {
    expect(parseContainerProjects("offgrid-e2e-1a2b3c4d\t\n")).toEqual([]);
  });
});

describe("isPortFree", () => {
  it("reports a port as taken while something listens on it, and free once it stops", async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;

    await expect(isPortFree(port)).resolves.toBe(false);

    await new Promise<void>((resolve) => server.close(() => resolve()));
    await expect(isPortFree(port)).resolves.toBe(true);
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
