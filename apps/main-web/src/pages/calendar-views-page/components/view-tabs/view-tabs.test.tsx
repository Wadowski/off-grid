// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ViewTabs } from "./view-tabs.js";

describe("ViewTabs", () => {
  it("shows the four calendar views as buttons in the view group, with the current one pressed", () => {
    render(<ViewTabs value="agenda" onChange={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Calendar view" });
    expect(within(group).getByRole("button", { name: "Agenda" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(group).getByRole("button", { name: "Day" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(within(group).getByRole("button", { name: "Week" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Month" })).toBeInTheDocument();
  });

  it("reports the view the person picks", () => {
    const onChange = vi.fn();
    render(<ViewTabs value="agenda" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Week" }));

    expect(onChange).toHaveBeenCalledWith("week");
  });
});
