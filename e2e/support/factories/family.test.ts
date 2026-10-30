// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { createFamily } from "./family.js";

const BASE_URL = "http://127.0.0.1:3000";

function recordingClient(reply: unknown) {
  const sent: { method: string | undefined; url: string; body: unknown }[] = [];
  const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
    sent.push({ method: init?.method, url: String(url), body: JSON.parse(String(init?.body)) });
    return Response.json(reply, { status: 201 });
  }) as typeof fetch;
  return { sent, api: createApiClient({ baseUrl: BASE_URL, fetch: fetchImpl }) };
}

describe("createFamily", () => {
  it("posts the family name to the families endpoint and returns the created family", async () => {
    const { sent, api } = recordingClient({ id: "f1", name: "Oak" });

    const family = await createFamily(api, { name: "Oak" });

    expect(family).toEqual({ id: "f1", name: "Oak" });
    expect(sent).toEqual([
      { method: "POST", url: `${BASE_URL}/api/families`, body: { name: "Oak" } },
    ]);
  });

  it("rejects a response that is not a family", async () => {
    const { api } = recordingClient({ name: "Oak" });

    await expect(createFamily(api, { name: "Oak" })).rejects.toThrow(
      "Response is not a family with a string id and name.",
    );
  });

  it("gives each family a unique generated name when none is given", async () => {
    const { sent, api } = recordingClient({ id: "f", name: "x" });

    await createFamily(api);
    await createFamily(api);

    const [first, second] = sent.map((request) => (request.body as { name: string }).name);
    expect(first).toMatch(/^Family [0-9a-f]{8}$/);
    expect(first).not.toBe(second);
  });
});
