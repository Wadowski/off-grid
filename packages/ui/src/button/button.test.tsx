// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button.js";

describe("Button", () => {
  it("renders a button of type button by default", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("dims a disabled button so it does not look enabled", () => {
    render(<Button disabled>Save</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("style", expect.stringContaining("opacity"));
  });

  it("calls its click handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("uses the primary and secondary colour tokens for each variant", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "style",
      expect.stringContaining("var(--og-color-accent)"),
    );

    rerender(<Button variant="secondary">Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "style",
      expect.stringContaining("var(--og-color-surface)"),
    );
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("og-focusable");
  });
});
