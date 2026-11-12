// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ViewSegmentedControl } from "./view-segmented-control.js";

describe("ViewSegmentedControl", () => {
  it("offers agenda, day, week and month with the current view pressed", () => {
    render(<ViewSegmentedControl value="week" onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Calendar view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agenda" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();
  });

  it("reports the view that is picked", () => {
    const onChange = vi.fn();
    render(<ViewSegmentedControl value="agenda" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Month" }));

    expect(onChange).toHaveBeenCalledWith("month");
  });
});
