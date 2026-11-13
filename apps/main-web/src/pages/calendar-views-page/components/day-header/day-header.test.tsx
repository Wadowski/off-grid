// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DayHeader } from "./day-header.js";

describe("DayHeader", () => {
  it("shows the weekday and date of the selected day", () => {
    render(<DayHeader date="2025-10-23" />);

    expect(screen.getByRole("heading", { name: "Thursday, October 23" })).toBeInTheDocument();
  });

  it("does not show a scheduled count", () => {
    render(<DayHeader date="2025-10-23" />);

    expect(screen.queryByText(/Scheduled/)).not.toBeInTheDocument();
  });
});
