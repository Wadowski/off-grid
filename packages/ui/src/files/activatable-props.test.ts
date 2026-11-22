// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { activatableProps } from "./activatable-props.js";

describe("activatableProps", () => {
  it("adds nothing when there is nothing to activate", () => {
    expect(activatableProps(undefined)).toEqual({});
  });

  it("makes the region a keyboard reachable button named by its own content", () => {
    const props = activatableProps(vi.fn());

    expect(props).toMatchObject({
      role: "button",
      tabIndex: 0,
      className: "og-focusable",
    });
    expect(props).not.toHaveProperty("aria-labelledby");
  });

  it("activates on click", () => {
    const onActivate = vi.fn();

    activatableProps(onActivate).onClick?.({} as never);

    expect(onActivate).toHaveBeenCalledOnce();
  });
});
