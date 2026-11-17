// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MaterialIcon } from "./material-icon.js";

describe("MaterialIcon", () => {
  it("is decoration that carries its glyph name in a data attribute", () => {
    const { container } = render(<MaterialIcon name="folder" size="1rem" color="red" />);

    const icon = container.firstElementChild as HTMLElement;
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("data-icon", "folder");
    expect(icon).toBeEmptyDOMElement();
  });

  it("uses the filled variation only when asked", () => {
    const { container } = render(<MaterialIcon name="folder" size="1rem" color="red" filled />);

    expect((container.firstElementChild as HTMLElement).style.fontVariationSettings).toContain(
      "FILL' 1",
    );
  });
});
