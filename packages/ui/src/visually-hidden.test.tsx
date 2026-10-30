// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisuallyHidden } from "./visually-hidden.js";

describe("VisuallyHidden", () => {
  it("keeps its text available to assistive technology", () => {
    render(<VisuallyHidden>Opens in a new tab</VisuallyHidden>);

    expect(screen.getByText("Opens in a new tab")).toBeInTheDocument();
  });

  it("clips itself out of the layout", () => {
    render(<VisuallyHidden>Opens in a new tab</VisuallyHidden>);

    expect(screen.getByText("Opens in a new tab")).toHaveStyle({
      position: "absolute",
      width: "1px",
    });
  });
});
