// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createCrossEntityLinkRequestSchema } from "./create-cross-entity-link-request-schema.js";
import { crossEntityLinkListQuerySchema } from "./cross-entity-link-list-query-schema.js";
import { crossEntityLinkListSchema } from "./cross-entity-link-list-schema.js";
import { crossEntityLinkParamsSchema } from "./cross-entity-link-params-schema.js";

const link = {
  id: randomUUID(),
  sourceType: "calendar-event",
  sourceId: randomUUID(),
  targetType: "calendar-event",
  targetId: randomUUID(),
  createdAt: "2026-11-20T10:00:00.000Z",
  title: "Dentist",
};

describe("createCrossEntityLinkRequestSchema", () => {
  it("accepts two calendar events", () => {
    expect(createCrossEntityLinkRequestSchema.parse(link)).toEqual({
      sourceType: link.sourceType,
      sourceId: link.sourceId,
      targetType: link.targetType,
      targetId: link.targetId,
    });
  });

  it("rejects an entity type that is not linkable", () => {
    expect(() =>
      createCrossEntityLinkRequestSchema.parse({ ...link, targetType: "note" }),
    ).toThrow();
  });

  it("rejects an entity id that is not a uuid", () => {
    expect(() =>
      createCrossEntityLinkRequestSchema.parse({ ...link, targetId: "not-a-uuid" }),
    ).toThrow();
  });
});

describe("crossEntityLinkListQuerySchema", () => {
  it("requires an entity type and id", () => {
    expect(() => crossEntityLinkListQuerySchema.parse({ entityType: "calendar-event" })).toThrow();
  });
});

describe("crossEntityLinkParamsSchema", () => {
  it("rejects a link id that is not a uuid", () => {
    expect(() => crossEntityLinkParamsSchema.parse({ id: "x" })).toThrow();
  });
});

describe("crossEntityLinkListSchema", () => {
  it("carries the title of the other end on each link", () => {
    expect(crossEntityLinkListSchema.parse({ links: [link] }).links[0]?.title).toBe("Dentist");
  });

  it("rejects a link without a title", () => {
    const untitled = { ...link, title: undefined };
    expect(() => crossEntityLinkListSchema.parse({ links: [untitled] })).toThrow();
  });
});
