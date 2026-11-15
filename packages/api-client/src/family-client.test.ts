// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createApiClient, createFamilyClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";
const FAMILY_ID = "1d2c3b4a-5f6e-4d7c-8b9a-0e1f2d3c4b5a";
const MEMBER = {
  userId: "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c",
  displayName: "Ben",
  role: "member",
  joinedAt: "2026-11-01T09:00:00.000Z",
};

const familiesWith = (body: unknown) => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { families: createFamilyClient(client), transport };
};

describe("createFamilyClient", () => {
  it("lists the families of the signed-in person", async () => {
    const family = {
      id: FAMILY_ID,
      name: "Home",
      role: "admin",
      accent: "teal",
      purpose: "household",
    };
    const { families, transport } = familiesWith({ families: [family] });

    await expect(families.listFamilies()).resolves.toEqual([family]);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/families`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("lists the members of one family", async () => {
    const { families, transport } = familiesWith({ members: [MEMBER] });

    await expect(families.listFamilyMembers(FAMILY_ID)).resolves.toEqual([MEMBER]);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/families/${FAMILY_ID}/members`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
