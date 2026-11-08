// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "./radio.js";

describe("Radio", () => {
  it("is named by its label", () => {
    render(<Radio name="method" value="a" label="Use my recovery code" />);

    expect(screen.getByRole("radio", { name: "Use my recovery code" })).not.toBeChecked();
  });

  it("reports the selection when it is clicked", () => {
    const onChange = vi.fn();
    render(<Radio name="method" value="a" label="Use my recovery code" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Use my recovery code" }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes its test id to the input", () => {
    render(<Radio name="method" value="a" label="Use my recovery code" data-testid="method-a" />);

    expect(screen.getByTestId("method-a")).toHaveAttribute("type", "radio");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(<Radio name="method" value="a" label="Use my recovery code" />);

    expect(screen.getByRole("radio")).toHaveClass("og-focusable");
  });
});
