// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwatchPicker } from "./swatch-picker.js";

const OPTIONS = ["blue", "teal"] as const;
type Option = (typeof OPTIONS)[number];

const LABELS = {
  blue: "families.accentBlue",
  teal: "families.accentTeal",
} as const;

const renderPicker = (value: Option, onChange = vi.fn()) =>
  render(
    <SwatchPicker<Option>
      headingId="test-swatch-heading"
      headingTextId="families.accentHeading"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      labelTextIds={LABELS}
      backgroundOf={(option) => (option === "blue" ? "#3b6fd4" : "#0f9488")}
      testIdPrefix="test-swatch"
    />,
  );

describe("SwatchPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders one labelled swatch per option and marks the selected one", () => {
    renderPicker("teal");

    expect(screen.getByTestId("test-swatch-blue").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByTestId("test-swatch-teal").getAttribute("aria-pressed")).toBe("true");
  });

  it("reports the option that was clicked", () => {
    const onChange = vi.fn();
    renderPicker("blue", onChange);

    fireEvent.click(screen.getByTestId("test-swatch-teal"));

    expect(onChange).toHaveBeenCalledWith("teal");
  });
});
