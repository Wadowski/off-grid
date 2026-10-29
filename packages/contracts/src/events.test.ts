// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineEvent, parseEvent } from "./events.js";

const familyCreatedV1 = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({ name: z.string().min(1).max(100) }),
});

const validEnvelope = {
  id: "0b7e6f0e-3c1a-4d2b-9f5e-8a1c2d3e4f50",
  type: "family-created-v1",
  version: 1,
  occurredAt: "2026-10-29T12:00:00.000Z",
  traceId: "trace-123",
  familyId: "5c2d1e0f-9a8b-4c7d-8e6f-1a2b3c4d5e6f",
  sourceVersion: 1,
  payload: { name: "Novak family" },
};

describe("defineEvent", () => {
  it("keeps the name, version and payload schema", () => {
    expect(familyCreatedV1.name).toBe("family-created-v1");
    expect(familyCreatedV1.version).toBe(1);
  });

  it("rejects a name that does not end in the version", () => {
    expect(() =>
      defineEvent({ name: "family-created-v1", version: 2, schema: z.object({}) }),
    ).toThrow(/-v2/);
  });

  it("rejects a name that is not kebab-case", () => {
    expect(() =>
      defineEvent({ name: "FamilyCreated-v1", version: 1, schema: z.object({}) }),
    ).toThrow(/kebab-case/);
  });
});

describe("parseEvent", () => {
  it("accepts a well-formed envelope", () => {
    expect(parseEvent(familyCreatedV1, validEnvelope)).toEqual(validEnvelope);
  });

  it("rejects an envelope with an invalid payload", () => {
    expect(() =>
      parseEvent(familyCreatedV1, { ...validEnvelope, payload: { name: "" } }),
    ).toThrow();
  });

  it("rejects an envelope with a different event type", () => {
    expect(() =>
      parseEvent(familyCreatedV1, { ...validEnvelope, type: "family-updated-v1" }),
    ).toThrow();
  });

  it("rejects an envelope with no trace id", () => {
    expect(() => parseEvent(familyCreatedV1, { ...validEnvelope, traceId: undefined })).toThrow();
  });

  it("rejects a source version below 1", () => {
    expect(() => parseEvent(familyCreatedV1, { ...validEnvelope, sourceVersion: 0 })).toThrow();
  });
});
