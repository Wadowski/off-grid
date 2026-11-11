// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventRemovedV1 } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { publishOwnedEvent } from "./publish-owned-event.js";
import type { SqlExecutor } from "./types.js";

const recordingExecutor = () => {
  const calls: unknown[][] = [];
  const executor: SqlExecutor = {
    query: async <Row = unknown>(text: string, values: unknown[] = []) => {
      calls.push(values);
      return { rows: [{ sequence: 1 }] as Row[] };
    },
  };
  return { executor, calls };
};

describe("publishOwnedEvent", () => {
  const payload = {
    eventId: "9b2e0c1a-0000-4000-8000-000000000001",
    calendarId: "9b2e0c1a-0000-4000-8000-000000000002",
  };

  it("stores a family-owned event under the family", async () => {
    const { executor, calls } = recordingExecutor();

    await publishOwnedEvent(
      executor,
      calendarEventRemovedV1,
      { familyId: "9b2e0c1a-0000-4000-8000-000000000003" },
      payload,
    );

    expect(calls[0]).toContain("9b2e0c1a-0000-4000-8000-000000000003");
    expect(calls[0]).toContain("calendar-event-removed-v1");
  });

  it("stores a personal event under the user when no family is given", async () => {
    const { executor, calls } = recordingExecutor();

    await publishOwnedEvent(
      executor,
      calendarEventRemovedV1,
      { familyId: null, userId: "9b2e0c1a-0000-4000-8000-000000000004" },
      payload,
    );

    expect(calls[0]).toContain("9b2e0c1a-0000-4000-8000-000000000004");
    expect(calls[0]).toContain(null);
  });
});
