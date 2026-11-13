// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  backgroundOf,
  newEventTarget,
  readBackground,
  viewOfBackground,
} from "./new-event-route.js";

describe("new event route", () => {
  it("keeps the path and search of the screen the modal opens over", () => {
    expect(backgroundOf({ pathname: "/calendar/day", search: "?date=2026-11-16" })).toBe(
      "/calendar/day?date=2026-11-16",
    );
  });

  it("points the modal at its own address, keeping the search and the background in the state", () => {
    expect(newEventTarget({ pathname: "/calendar/week", search: "?date=2026-11-16" })).toEqual({
      to: { pathname: "/calendar/event/new", search: "?date=2026-11-16" },
      state: { background: "/calendar/week?date=2026-11-16" },
    });
  });

  it("reads the background from the navigation state, and only from a calendar address", () => {
    expect(readBackground({ background: "/calendar/month" })).toBe("/calendar/month");
    expect(readBackground({ background: "/settings" })).toBeUndefined();
    expect(readBackground(null)).toBeUndefined();
    expect(readBackground({})).toBeUndefined();
  });

  it("shows the view of the background screen, and the agenda for a deep link", () => {
    expect(viewOfBackground("/calendar/day?date=2026-11-16")).toBe("day");
    expect(viewOfBackground("/calendar/month")).toBe("month");
    expect(viewOfBackground(undefined)).toBe("agenda");
  });
});
