// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Textarea } from "./textarea.js";

describe("Textarea", () => {
  afterEach(() => {
    cleanup();
  });

  it("names the textarea with its label", () => {
    render(<Textarea label="Notes" />);

    expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
  });

  it("marks the textarea invalid and describes it with the error", () => {
    render(<Textarea label="Notes" error="Too long" />);

    const field = screen.getByRole("textbox", { name: "Notes" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Too long");
  });
});
