// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconTile } from "./icon-tile.js";

describe("IconTile", () => {
  it("renders its content as decoration, hidden from assistive technology", () => {
    const { container } = render(
      <IconTile size="2rem" background="red" color="white">
        AS
      </IconTile>,
    );

    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile).toHaveTextContent("AS");
    expect(tile.style.width).toBe("2rem");
  });

  it("is round when the shape is circle", () => {
    const { container } = render(
      <IconTile size="3rem" shape="circle" background="red" color="white">
        A
      </IconTile>,
    );

    expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe("9999px");
  });
});
