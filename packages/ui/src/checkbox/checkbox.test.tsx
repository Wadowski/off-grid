// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox.js";

describe("Checkbox", () => {
  it("is named by its label", () => {
    render(<Checkbox label="Remember me" />);

    expect(screen.getByRole("checkbox", { name: "Remember me" })).not.toBeChecked();
  });

  it("reports each change of its checked state", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeChecked();
  });

  it("passes its test id to the input", () => {
    render(<Checkbox label="Remember me" data-testid="remember-me" />);

    expect(screen.getByTestId("remember-me")).toHaveAttribute("type", "checkbox");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(<Checkbox label="Remember me" />);

    expect(screen.getByRole("checkbox")).toHaveClass("og-focusable");
  });
});
