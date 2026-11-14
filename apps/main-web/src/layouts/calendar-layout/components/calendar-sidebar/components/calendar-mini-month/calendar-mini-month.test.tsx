// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isoWeekNumber, mondayOf } from "../../../../../../calendar-views/week-days.js";
import { CalendarMiniMonth } from "./calendar-mini-month.js";

const renderMiniMonth = (onSelect = vi.fn()) =>
  render(
    <CalendarMiniMonth selectedDate="2026-11-18" todayDate="2026-11-13" onSelect={onSelect} />,
  );

describe("CalendarMiniMonth", () => {
  afterEach(() => {
    cleanup();
  });

  it("is a named region that shows the month of the selected date", () => {
    renderMiniMonth();

    const region = screen.getByRole("region", { name: "Mini month" });
    expect(within(region).getByText("November 2026")).toBeInTheDocument();
  });

  it("shows every day of the month once", () => {
    const { container } = renderMiniMonth();

    const days = container.querySelectorAll("[data-testid^='mini-month-day-2026-11-']");
    expect(days).toHaveLength(30);
  });

  it("shows the ISO week number of each week, matching the week helper", () => {
    renderMiniMonth();

    const region = screen.getByRole("region", { name: "Mini month" });
    expect(isoWeekNumber(mondayOf("2026-11-02"))).toBe(45);
    expect(within(region).getByText("45")).toBeInTheDocument();
    expect(within(region).getByText("47")).toBeInTheDocument();
  });

  it("marks the selected day as the current date", () => {
    renderMiniMonth();

    expect(screen.getByTestId("mini-month-day-2026-11-18")).toHaveAttribute("aria-current", "date");
    expect(screen.getByTestId("mini-month-day-2026-11-19")).not.toHaveAttribute("aria-current");
  });

  it("names each day with its full date", () => {
    renderMiniMonth();

    expect(screen.getByTestId("mini-month-day-2026-11-20")).toHaveAccessibleName(
      "Friday, November 20, 2026",
    );
  });

  it("reports the ISO date of the day that was clicked", () => {
    const onSelect = vi.fn();
    renderMiniMonth(onSelect);

    fireEvent.click(screen.getByTestId("mini-month-day-2026-11-20"));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("2026-11-20");
  });
});
