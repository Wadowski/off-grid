// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_FILES_VIEW_PREFERENCE, FILES_VIEW_PREFERENCE_KEY } from "./constants.js";
import { useFilesViewPreference } from "./use-files-view-preference.js";

describe("useFilesViewPreference", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("starts from the stored preference and saves each change", () => {
    const { result } = renderHook(() => useFilesViewPreference());
    expect(result.current.preference).toEqual(DEFAULT_FILES_VIEW_PREFERENCE);

    act(() => result.current.updatePreference({ view: "grid" }));
    act(() => result.current.updatePreference({ sort: "size", direction: "desc" }));

    expect(result.current.preference).toEqual({ view: "grid", sort: "size", direction: "desc" });
    expect(JSON.parse(window.localStorage.getItem(FILES_VIEW_PREFERENCE_KEY) ?? "null")).toEqual({
      view: "grid",
      sort: "size",
      direction: "desc",
    });
  });
});
