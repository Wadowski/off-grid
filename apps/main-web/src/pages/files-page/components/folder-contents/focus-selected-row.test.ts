// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { focusSelectedRow } from "./focus-selected-row.js";

describe("focusSelectedRow", () => {
  it("moves focus to the selected row activator inside the container", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<div tabindex="0">one</div><div tabindex="0" aria-current="true">two</div>';
    document.body.append(container);

    focusSelectedRow(container);

    expect(document.activeElement?.textContent).toBe("two");
    container.remove();
  });

  it("does nothing when no row is selected", () => {
    const container = document.createElement("div");
    container.innerHTML = '<div tabindex="0">one</div>';
    document.body.append(container);

    expect(() => focusSelectedRow(container)).not.toThrow();
    container.remove();
  });

  it("does nothing without a container", () => {
    expect(() => focusSelectedRow(null)).not.toThrow();
  });
});
