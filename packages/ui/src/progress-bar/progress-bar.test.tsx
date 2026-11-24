// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar.js";

describe("ProgressBar", () => {
  it("exposes a labelled progressbar with its value", () => {
    render(<ProgressBar label="Holiday.txt" percent={42} testId="progress" />);

    const bar = screen.getByRole("progressbar", { name: "Holiday.txt" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("data-testid", "progress");
  });

  it("rounds the value to a whole percent", () => {
    render(<ProgressBar label="A" percent={33.6} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "34");
  });

  it("clamps the value between 0 and 100", () => {
    const { rerender } = render(<ProgressBar label="A" percent={-5} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    rerender(<ProgressBar label="A" percent={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
