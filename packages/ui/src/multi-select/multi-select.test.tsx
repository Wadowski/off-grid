// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./multi-select.js";
import type { MultiSelectOption } from "./types.js";

const OPTIONS: readonly MultiSelectOption[] = [
  { value: "work", label: "Work" },
  { value: "home", label: "Home" },
];

const renderSelect = (selected: ReadonlySet<string>, onChange = vi.fn()) =>
  render(
    <MultiSelect
      options={OPTIONS}
      selected={selected}
      onChange={onChange}
      summary="All"
      triggerLabel="Filter: All"
      groupLabel="Filter"
      testId="filter"
    />,
  );

describe("MultiSelect", () => {
  it("opens a group of checkboxes that reflect the selection", () => {
    renderSelect(new Set(["work"]));

    const trigger = screen.getByRole("button", { name: "Filter: All" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Filter" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Work" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Home" })).not.toBeChecked();
  });

  it("adds and removes an option without changing the other selections", () => {
    const onChange = vi.fn();
    renderSelect(new Set(["work"]), onChange);
    fireEvent.click(screen.getByRole("button", { name: "Filter: All" }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Home" }));
    expect(onChange).toHaveBeenLastCalledWith(new Set(["work", "home"]));

    fireEvent.click(screen.getByRole("checkbox", { name: "Work" }));
    expect(onChange).toHaveBeenLastCalledWith(new Set());
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderSelect(new Set(["work"]));
    const trigger = screen.getByRole("button", { name: "Filter: All" });
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByRole("group", { name: "Filter" }), { key: "Escape" });

    expect(screen.queryByRole("group", { name: "Filter" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes when the person presses outside it", () => {
    renderSelect(new Set(["work"]));
    fireEvent.click(screen.getByRole("button", { name: "Filter: All" }));

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("group", { name: "Filter" })).not.toBeInTheDocument();
  });
});
