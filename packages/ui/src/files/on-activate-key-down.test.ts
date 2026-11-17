// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { onActivateKeyDown } from "./on-activate-key-down.js";

describe("onActivateKeyDown", () => {
  it("activates on Enter", () => {
    const onActivate = vi.fn();
    const preventDefault = vi.fn();

    onActivateKeyDown(onActivate, { key: "Enter", preventDefault });

    expect(onActivate).toHaveBeenCalledOnce();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("activates on Space and keeps the page from scrolling", () => {
    const onActivate = vi.fn();
    const preventDefault = vi.fn();

    onActivateKeyDown(onActivate, { key: " ", preventDefault });

    expect(onActivate).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it.each(["a", "Tab", "Escape", "ArrowDown"])("ignores the %s key", (key) => {
    const onActivate = vi.fn();
    const preventDefault = vi.fn();

    onActivateKeyDown(onActivate, { key, preventDefault });

    expect(onActivate).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
