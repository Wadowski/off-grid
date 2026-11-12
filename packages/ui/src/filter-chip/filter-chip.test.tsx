// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "./filter-chip.js";

describe("FilterChip", () => {
  it("is named by its label and reports its pressed state", () => {
    render(<FilterChip label="Family" selected onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Family" })).toHaveAttribute("aria-pressed", "true");
  });

  it("is not pressed when unselected", () => {
    render(<FilterChip label="Family" selected={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Family" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onToggle when activated", () => {
    const onToggle = vi.fn();
    render(<FilterChip label="Family" selected={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Family" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("hides the colour dot from assistive technology", () => {
    const { container } = render(
      <FilterChip label="Family" selected={false} onToggle={vi.fn()} dotColor="rgb(0, 102, 255)" />,
    );

    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Family" })).toHaveTextContent("Family");
  });

  it("passes its test id to the button", () => {
    render(<FilterChip label="Family" selected={false} onToggle={vi.fn()} data-testid="chip-family" />);

    expect(screen.getByTestId("chip-family")).toHaveTextContent("Family");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(<FilterChip label="Family" selected={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Family" })).toHaveClass("og-focusable");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FilterChip label="Family" selected onToggle={vi.fn()} dotColor="rgb(0, 102, 255)" />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
