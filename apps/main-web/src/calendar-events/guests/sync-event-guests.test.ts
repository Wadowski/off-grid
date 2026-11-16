// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  inviteEventGuest: vi.fn(),
  removeEventGuest: vi.fn(),
}));

vi.mock("../../api/web-api-client.js", () => ({
  webCalendarClient: client,
}));

import { syncEventGuests } from "./sync-event-guests.js";

const EVENT_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";

describe("syncEventGuests", () => {
  it("invites and removes the guests in the changes", async () => {
    client.inviteEventGuest.mockResolvedValue(undefined);
    client.removeEventGuest.mockResolvedValue(undefined);

    const failed = await syncEventGuests(EVENT_ID, { toInvite: ["ben"], toRemove: ["cara"] });

    expect(failed).toEqual({ toInvite: [], toRemove: [] });
    expect(client.inviteEventGuest).toHaveBeenCalledWith(EVENT_ID, "ben");
    expect(client.removeEventGuest).toHaveBeenCalledWith(EVENT_ID, "cara");
  });

  it("returns the invites and removals that failed so they can be retried", async () => {
    client.inviteEventGuest.mockRejectedValue(new Error("down"));
    client.removeEventGuest.mockResolvedValue(undefined);

    const failed = await syncEventGuests(EVENT_ID, { toInvite: ["ben"], toRemove: ["cara"] });

    expect(failed).toEqual({ toInvite: ["ben"], toRemove: [] });
  });
});
