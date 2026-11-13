// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ViewSelect } from "./view-select.js";

describe("ViewSelect", () => {
  it("lists the four calendar views under the view label", () => {
    render(<ViewSelect value="agenda" onChange={vi.fn()} />);

    const select = screen.getByRole("combobox", { name: "Calendar view" });
    expect(select).toHaveValue("agenda");
    expect(screen.getByRole("option", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Day" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Month" })).toBeInTheDocument();
  });

  it("reports the view the person picks", () => {
    const onChange = vi.fn();
    render(<ViewSelect value="agenda" onChange={onChange} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Calendar view" }), {
      target: { value: "week" },
    });

    expect(onChange).toHaveBeenCalledWith("week");
  });
});
