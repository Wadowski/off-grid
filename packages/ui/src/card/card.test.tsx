// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card.js";

describe("Card", () => {
  it("renders its children on the surface colour token", () => {
    render(
      <Card>
        <p>Family summary</p>
      </Card>,
    );

    expect(screen.getByText("Family summary").parentElement).toHaveAttribute(
      "style",
      expect.stringContaining("var(--og-color-surface)"),
    );
  });
});
