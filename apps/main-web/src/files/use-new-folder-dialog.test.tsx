// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNewFolderDialog } from "./use-new-folder-dialog.js";

describe("useNewFolderDialog", () => {
  it("opens and closes, and returns focus to the element that opened it", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { result } = renderHook(() => useNewFolderDialog());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
