// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReminderRow } from "./reminder-row.js";
import type { ReminderRowProps } from "./types.js";

const renderRow = (overrides: Partial<ReminderRowProps> = {}) => {
  const handlers = { onAmount: vi.fn(), onUnit: vi.fn(), onRemove: vi.fn() };
  render(
    <ReminderRow
      index={0}
      total={1}
      draft={{ key: 1, amount: "15", unit: "minute" }}
      error={undefined}
      disabled={false}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

describe("ReminderRow", () => {
  afterEach(cleanup);

  it("offers the four units, singular for one and plural otherwise", () => {
    renderRow({ draft: { key: 1, amount: "1", unit: "hour" } });

    const labels = screen.getAllByRole("option").map((option) => option.textContent);
    expect(labels).toEqual(["minute", "hour", "day", "week"]);
  });

  it("uses plural unit names for other amounts", () => {
    renderRow();

    const labels = screen.getAllByRole("option").map((option) => option.textContent);
    expect(labels).toEqual(["minutes", "hours", "days", "weeks"]);
  });

  it("reports the typed amount, the chosen unit and the remove press", () => {
    const handlers = renderRow();

    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "week" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove reminder" }));

    expect(handlers.onAmount).toHaveBeenCalledWith("20");
    expect(handlers.onUnit).toHaveBeenCalledWith("week");
    expect(handlers.onRemove).toHaveBeenCalledOnce();
  });

  it("marks the number invalid and describes it with the error text", () => {
    renderRow({ error: "duplicate" });

    const amount = screen.getByLabelText("Amount");
    expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(amount).toHaveAccessibleDescription("You already have a reminder at this time.");
  });
});
