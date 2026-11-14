// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { NO_HIDDEN_CALENDARS } from "../../calendar-views/events-by-calendar.js";
import {
  HIDDEN_CALENDARS_KEY,
  readHiddenCalendars,
  writeHiddenCalendars,
} from "./hidden-calendars-storage.js";

describe("hidden calendars storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns the ids that were written", () => {
    writeHiddenCalendars(new Set(["cal-1", "cal-2"]));

    expect([...readHiddenCalendars()].sort()).toEqual(["cal-1", "cal-2"]);
  });

  it("shows every calendar when nothing was stored", () => {
    expect(readHiddenCalendars()).toEqual(NO_HIDDEN_CALENDARS);
  });

  it("shows every calendar when the stored value is not valid JSON", () => {
    window.localStorage.setItem(HIDDEN_CALENDARS_KEY, "{not json");

    expect(readHiddenCalendars()).toEqual(NO_HIDDEN_CALENDARS);
  });

  it("shows every calendar when the stored value has the wrong shape", () => {
    window.localStorage.setItem(HIDDEN_CALENDARS_KEY, JSON.stringify({ hidden: ["cal-1"] }));

    expect(readHiddenCalendars()).toEqual(NO_HIDDEN_CALENDARS);
  });

  it("does not throw when the browser blocks reading", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    expect(readHiddenCalendars()).toEqual(NO_HIDDEN_CALENDARS);
  });

  it("does not throw when the browser blocks writing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    expect(() => writeHiddenCalendars(new Set(["cal-1"]))).not.toThrow();
  });
});
