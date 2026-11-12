// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { DateNavigator } from "./date-navigator.js";

const renderNavigator = () => {
  const handlers = { onPrevious: vi.fn(), onNext: vi.fn(), onToday: vi.fn() };
  render(<DateNavigator label="October 2025" {...handlers} />);
  return handlers;
};

describe("DateNavigator", () => {
  it("shows the period label", () => {
    renderNavigator();

    expect(screen.getByText("October 2025")).toBeInTheDocument();
  });

  it("moves to the previous and next period from the arrows", () => {
    const handlers = renderNavigator();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(handlers.onPrevious).toHaveBeenCalledTimes(1);
    expect(handlers.onNext).toHaveBeenCalledTimes(1);
  });

  it("returns to today from the Today button", () => {
    const handlers = renderNavigator();

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(handlers.onToday).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <DateNavigator
        label="October 2025"
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
      />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
