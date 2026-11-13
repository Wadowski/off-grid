// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { describe, expect, it, vi } from "vitest";
import { findReadOnlyEventIds } from "./find-read-only-event-ids.js";

describe("findReadOnlyEventIds", () => {
  it("asks for the guest rows of the listed events and returns the ids the guest has", async () => {
    const findMany = vi.fn(async () => [{ eventId: "event-b" }]);
    const tx = { eventGuest: { findMany } } as unknown as ModuleTransaction;

    const ids = await findReadOnlyEventIds(tx, {
      guestUserId: "guest",
      records: [{ eventId: "event-a" }, { eventId: "event-b" }],
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { guestUserId: "guest", eventId: { in: ["event-a", "event-b"] } },
      select: { eventId: true },
    });
    expect([...ids]).toEqual(["event-b"]);
  });

  it("returns no ids and skips nothing when the list is empty", async () => {
    const findMany = vi.fn(async () => []);
    const tx = { eventGuest: { findMany } } as unknown as ModuleTransaction;

    const ids = await findReadOnlyEventIds(tx, { guestUserId: "guest", records: [] });

    expect(ids.size).toBe(0);
  });
});
