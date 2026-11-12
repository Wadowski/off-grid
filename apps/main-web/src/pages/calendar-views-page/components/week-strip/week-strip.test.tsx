// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeekStrip } from "./week-strip.js";

const DATES = [
  "2025-10-20",
  "2025-10-21",
  "2025-10-22",
  "2025-10-23",
  "2025-10-24",
  "2025-10-25",
  "2025-10-26",
];

describe("WeekStrip", () => {
  it("shows seven days from Monday to Sunday with the weekday and the day number", () => {
    render(
      <WeekStrip
        dates={DATES}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByTestId("week-strip-2025-10-20")).toHaveTextContent("Mon");
    expect(screen.getByTestId("week-strip-2025-10-26")).toHaveTextContent("26");
  });

  it("marks the selected day as the current date", () => {
    render(
      <WeekStrip
        dates={DATES}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByTestId("week-strip-2025-10-23")).toHaveAttribute("aria-current", "date");
    expect(screen.getByTestId("week-strip-2025-10-22")).not.toHaveAttribute("aria-current");
  });

  it("reports the day that is picked", () => {
    const onSelect = vi.fn();
    render(
      <WeekStrip
        dates={DATES}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId("week-strip-2025-10-24"));

    expect(onSelect).toHaveBeenCalledWith("2025-10-24");
  });
});
