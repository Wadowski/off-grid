// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar.js";

describe("Avatar", () => {
  it("shows the initials", () => {
    render(<Avatar initials="AS" />);

    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("is hidden from assistive technology because the name is shown beside it", () => {
    render(<Avatar initials="AS" />);

    expect(screen.getByText("AS")).toHaveAttribute("aria-hidden", "true");
  });
});
