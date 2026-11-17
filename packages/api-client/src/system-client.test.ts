// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createApiClient, createSystemClient } from "./index.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const systemWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: "http://localhost:3000/api", fetch: transport });
  return { system: createSystemClient(client), transport };
};

describe("createSystemClient", () => {
  it("requests the running version anonymously and returns it parsed", async () => {
    const { system, transport } = systemWith(jsonResponse({ version: "1.2.3", commit: "abc1234" }));

    await expect(system.version()).resolves.toEqual({ version: "1.2.3", commit: "abc1234" });
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/system/version",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a response that carries fields beyond the version schema", async () => {
    const { system } = systemWith(jsonResponse({ version: "1.2.3", hostname: "box" }));

    await expect(system.version()).rejects.toThrow();
  });
});
