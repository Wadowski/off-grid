// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineEvent } from "./events.js";
import {
  canonicalJson,
  compareReleasedEvents,
  currentEventSchemas,
  type EventSchemas,
} from "./released.js";

const familyCreatedV1 = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({ name: z.string().min(1).max(100) }),
});

const released: EventSchemas = currentEventSchemas([familyCreatedV1]);

describe("canonicalJson", () => {
  it("gives the same text whatever order the keys were written in", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(
      canonicalJson({ a: { c: 3, d: 2 }, b: 1 }),
    );
  });
});

describe("compareReleasedEvents", () => {
  it("reports nothing when the live schema matches the snapshot", () => {
    expect(compareReleasedEvents(released, currentEventSchemas([familyCreatedV1]))).toEqual({
      changed: [],
      missing: [],
      added: [],
    });
  });

  it("flags a released event whose payload schema was edited", () => {
    const edited = defineEvent({
      name: "family-created-v1",
      version: 1,
      schema: z.object({ name: z.string().min(1).max(200) }),
    });

    expect(compareReleasedEvents(released, currentEventSchemas([edited])).changed).toEqual([
      "family-created-v1",
    ]);
  });

  it("flags a released event that is no longer defined", () => {
    expect(compareReleasedEvents(released, {}).missing).toEqual(["family-created-v1"]);
  });

  it("allows a new event that is not in the snapshot yet", () => {
    const familyUpdatedV1 = defineEvent({
      name: "family-updated-v1",
      version: 1,
      schema: z.object({ name: z.string().min(1).max(100) }),
    });

    expect(
      compareReleasedEvents(released, currentEventSchemas([familyCreatedV1, familyUpdatedV1])),
    ).toEqual({ changed: [], missing: [], added: ["family-updated-v1"] });
  });

  it("allows a new version alongside the released one", () => {
    const familyCreatedV2 = defineEvent({
      name: "family-created-v2",
      version: 2,
      schema: z.object({ name: z.string().min(1).max(100), locale: z.string() }),
    });

    expect(
      compareReleasedEvents(released, currentEventSchemas([familyCreatedV1, familyCreatedV2])),
    ).toEqual({ changed: [], missing: [], added: ["family-created-v2"] });
  });
});
