// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createApiClient, createRelationsClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";
const FAMILY_ID = randomUUID();
const LINK_ID = randomUUID();
const EVENT_ID = randomUUID();
const OTHER_ID = randomUUID();

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const relationsWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { links: createRelationsClient(client), transport };
};

describe("createRelationsClient", () => {
  it("lists the links of an event with the title of the other end", async () => {
    const { links, transport } = relationsWith(
      jsonResponse({
        links: [
          {
            id: LINK_ID,
            sourceType: "calendar-event",
            sourceId: EVENT_ID,
            targetType: "calendar-event",
            targetId: OTHER_ID,
            createdAt: "2026-11-20T10:00:00.000Z",
            title: "Dentist",
          },
        ],
      }),
    );

    const listed = await links.listCrossEntityLinks("calendar-event", EVENT_ID, FAMILY_ID);

    expect(listed.map((link) => link.title)).toEqual(["Dentist"]);
    expect(transport.mock.calls[0]?.[0]).toBe(
      `${BASE_URL}/links?entityType=calendar-event&entityId=${EVENT_ID}`,
    );
    expect(transport.mock.calls[0]?.[1]?.headers).toMatchObject({
      "x-offgrid-family-id": FAMILY_ID,
    });
  });

  it("creates a link between two events", async () => {
    const { links, transport } = relationsWith(
      jsonResponse(
        {
          id: LINK_ID,
          sourceType: "calendar-event",
          sourceId: EVENT_ID,
          targetType: "calendar-event",
          targetId: OTHER_ID,
          createdAt: "2026-11-20T10:00:00.000Z",
        },
        201,
      ),
    );

    const created = await links.createCrossEntityLink({
      sourceType: "calendar-event",
      sourceId: EVENT_ID,
      targetType: "calendar-event",
      targetId: OTHER_ID,
    });

    expect(created.id).toBe(LINK_ID);
    expect(transport.mock.calls[0]?.[1]?.method).toBe("POST");
  });

  it("removes a link by id", async () => {
    const { links, transport } = relationsWith(new Response(null, { status: 204 }));

    await links.removeCrossEntityLink(LINK_ID);

    expect(transport.mock.calls[0]?.[0]).toBe(`${BASE_URL}/links/${LINK_ID}`);
    expect(transport.mock.calls[0]?.[1]?.method).toBe("DELETE");
  });
});
