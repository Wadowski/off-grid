// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventDetailsPathFor, eventDetailsTarget } from "./event-details-route.js";

describe("event details route", () => {
  it("builds the details address from the event id only", () => {
    expect(eventDetailsPathFor("3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f")).toBe(
      "/calendar/event/3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f",
    );
  });

  it("keeps the current view as the background behind the details", () => {
    expect(
      eventDetailsTarget({ pathname: "/calendar/week", search: "?date=2026-11-16" }, "evt-1"),
    ).toEqual({
      to: { pathname: "/calendar/event/evt-1", search: "" },
      state: { background: "/calendar/week?date=2026-11-16" },
    });
  });
});
