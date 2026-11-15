// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarRoutes } from "./calendar-routes.js";

describe("calendarRoutes", () => {
  it("exposes the single-event route used to read, update and delete an event", () => {
    expect(calendarRoutes.calendarEvent).toBe("/events/:id");
  });
});
