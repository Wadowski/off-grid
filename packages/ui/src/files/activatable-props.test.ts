// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { activatableProps } from "./activatable-props.js";

describe("activatableProps", () => {
  it("adds nothing when there is nothing to activate", () => {
    expect(activatableProps(undefined, "name", "meta")).toEqual({});
  });

  it("makes the region a keyboard reachable button named by its visible name and meta", () => {
    const props = activatableProps(vi.fn(), "name", "meta");

    expect(props).toMatchObject({
      role: "button",
      tabIndex: 0,
      className: "og-focusable",
      "aria-labelledby": "name meta",
    });
  });

  it("activates on click", () => {
    const onActivate = vi.fn();

    activatableProps(onActivate, "name", "meta").onClick?.({} as never);

    expect(onActivate).toHaveBeenCalledOnce();
  });
});
