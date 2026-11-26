// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton.js";

describe("Skeleton", () => {
  it("renders a decorative block of the given size that pulses", () => {
    const { container } = render(<Skeleton width="10rem" height="1rem" testId="block" />);

    const block = container.firstElementChild as HTMLElement;
    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block).toHaveAttribute("data-testid", "block");
    expect(block).toHaveClass("og-pulse");
    expect(block.style.width).toBe("10rem");
    expect(block.style.height).toBe("1rem");
  });

  it("is rounded by default and round when the shape is circle", () => {
    const { container, rerender } = render(<Skeleton width="2rem" height="2rem" />);
    expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe(
      "var(--og-radius-sm)",
    );

    rerender(<Skeleton width="2rem" height="2rem" shape="circle" />);
    expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe(
      "var(--og-radius-full)",
    );
  });
});
