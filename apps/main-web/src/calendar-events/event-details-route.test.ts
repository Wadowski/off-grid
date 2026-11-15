// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventDetailsTarget } from "./event-details-route.js";

describe("event details route", () => {
  it("keeps the current view as the background behind the details", () => {
    expect(
      eventDetailsTarget({ pathname: "/calendar/week", search: "?date=2026-11-16" }, "evt-1"),
    ).toEqual({
      to: { pathname: "/calendar/event/evt-1", search: "" },
      state: { background: "/calendar/week?date=2026-11-16" },
    });
  });
});
