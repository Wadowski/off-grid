// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FILES_VIEW_PREFERENCE, FILES_VIEW_PREFERENCE_KEY } from "./constants.js";
import { readFilesViewPreference } from "./read-files-view-preference.js";
import { writeFilesViewPreference } from "./write-files-view-preference.js";

const GRID_BY_SIZE = { view: "grid", sort: "size", direction: "desc" } as const;

describe("files view preference storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns the list sorted by name ascending when nothing was stored", () => {
    expect(readFilesViewPreference()).toEqual(DEFAULT_FILES_VIEW_PREFERENCE);
  });

  it("returns the preference that was written", () => {
    writeFilesViewPreference(GRID_BY_SIZE);

    expect(readFilesViewPreference()).toEqual(GRID_BY_SIZE);
  });

  it.each([
    ["not JSON", "{not json"],
    ["a wrong shape", JSON.stringify({ view: "tiles", sort: "name", direction: "asc" })],
    ["an unknown sort field", JSON.stringify({ view: "list", sort: "type", direction: "asc" })],
  ])("returns the defaults when the stored value is %s", (_label, raw) => {
    window.localStorage.setItem(FILES_VIEW_PREFERENCE_KEY, raw);

    expect(readFilesViewPreference()).toEqual(DEFAULT_FILES_VIEW_PREFERENCE);
  });

  it("returns the defaults when browser storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readFilesViewPreference()).toEqual(DEFAULT_FILES_VIEW_PREFERENCE);
  });

  it("keeps working when browser storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => writeFilesViewPreference(GRID_BY_SIZE)).not.toThrow();
  });
});
