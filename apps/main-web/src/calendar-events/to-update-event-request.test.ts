// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { withField } from "./event-form.js";
import { toUpdateEventRequest } from "./to-update-event-request.js";
import type { EventFormValues } from "./types.js";

const TIME_ZONE = "Europe/Warsaw";
const CALENDAR_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";

const timedForm = (overrides: Partial<EventFormValues> = {}): EventFormValues => ({
  title: "Studio review",
  calendarId: CALENDAR_ID,
  isAllDay: false,
  startDate: "2026-07-01",
  startTime: "12:00",
  endDate: "2026-07-01",
  endTime: "13:00",
  location: "",
  description: "",
  guestUserIds: [],
  ...overrides,
});

describe("toUpdateEventRequest", () => {
  it("sends only the title when only the title changed", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(
      initial,
      withField(initial, "title", "Studio retro"),
      TIME_ZONE,
    );

    expect(result).toEqual({ ok: true, request: { title: "Studio retro" } });
  });

  it("sends nothing when no field changed", () => {
    const initial = timedForm();
    expect(toUpdateEventRequest(initial, initial, TIME_ZONE)).toEqual({
      ok: true,
      request: undefined,
    });
  });

  it("sends null for a location or note that was cleared", () => {
    const initial = timedForm({ location: "West Gate", description: "Deck" });
    const result = toUpdateEventRequest(
      initial,
      { ...initial, location: "  ", description: "" },
      TIME_ZONE,
    );

    expect(result).toEqual({ ok: true, request: { location: null, description: null } });
  });

  it("sends only the end time when only the end changed", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(initial, withField(initial, "endTime", "14:00"), TIME_ZONE);

    expect(result).toEqual({
      ok: true,
      request: { endsAt: "2026-07-01T12:00:00.000Z" },
    });
  });

  it("refuses an edit that ends before it starts with the same error as a new event", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(initial, withField(initial, "endTime", "11:00"), TIME_ZONE);

    expect(result).toEqual({ ok: false, errors: { end: "endsBeforeStart" } });
  });

  it("refuses an update when the loaded event cannot be read back as a valid form", () => {
    const initial = timedForm({ title: "" });
    expect(toUpdateEventRequest(initial, timedForm(), TIME_ZONE)).toEqual({
      ok: false,
      errors: { form: "invalid" },
    });
  });
});
