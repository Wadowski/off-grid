// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { en } from "./catalogs/en.js";

const seededCalendarKeys = [
  "calendar.heading",
  "calendar.calendars.heading",
  "calendar.calendars.create",
  "calendar.calendars.name",
  "calendar.calendars.namePlaceholder",
  "calendar.calendars.color",
  "calendar.calendars.edit",
  "calendar.calendars.delete",
  "calendar.calendars.deleteConfirm",
  "calendar.views.agenda",
  "calendar.views.day",
  "calendar.views.week",
  "calendar.views.month",
  "calendar.views.today",
  "calendar.event.new",
  "calendar.event.title",
  "calendar.event.calendar",
  "calendar.actions.save",
  "calendar.actions.cancel",
  "calendar.actions.close",
  "calendar.errors.nameRequired",
  "calendar.errors.defaultCalendar",
  "calendar.errors.notFound",
  "calendar.errors.failed",
];

const resolve = (path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], en);

describe("calendar message catalog", () => {
  it.each(seededCalendarKeys)("resolves %s to a non-empty string", (key) => {
    const value = resolve(key);

    expect(typeof value).toBe("string");
    expect(value).not.toBe("");
  });
});
