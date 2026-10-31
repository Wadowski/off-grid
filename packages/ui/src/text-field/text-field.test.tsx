// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "./text-field.js";

describe("TextField", () => {
  it("associates its label with the input", () => {
    render(<TextField label="Family name" />);

    expect(screen.getByRole("textbox", { name: "Family name" })).toBeInTheDocument();
  });

  it("renders no error message and no invalid state without an error", () => {
    render(<TextField label="Family name" />);

    const input = screen.getByLabelText("Family name");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("shows the error, marks the input invalid and links the message to it", () => {
    render(<TextField label="Family name" error="Name is required." />);

    const input = screen.getByLabelText("Family name");
    const message = screen.getByText("Name is required.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Name is required.");
    expect(message).toHaveAttribute("id", input.getAttribute("aria-describedby"));
  });

  it("passes input attributes through to the input element", () => {
    render(<TextField label="Family name" id="family-name" name="familyName" required />);

    const input = screen.getByLabelText("Family name");
    expect(input).toHaveAttribute("id", "family-name");
    expect(input).toHaveAttribute("name", "familyName");
    expect(input).toBeRequired();
  });
});
