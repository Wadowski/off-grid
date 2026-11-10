// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag } from "./tag.js";

describe("Tag", () => {
  it("shows its content", () => {
    render(<Tag>Admin</Tag>);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("passes its test id through", () => {
    render(<Tag data-testid="role-tag">Member</Tag>);

    expect(screen.getByTestId("role-tag")).toHaveTextContent("Member");
  });
});
