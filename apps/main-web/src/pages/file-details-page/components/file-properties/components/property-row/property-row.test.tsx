// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PropertyRow } from "./property-row.js";

describe("PropertyRow", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the label and the value side by side", () => {
    render(
      <dl>
        <PropertyRow testId="row" labelTextId="files.details.version" isFirst>
          Version 3
        </PropertyRow>
      </dl>,
    );

    const row = screen.getByTestId("row");
    expect(row).toHaveTextContent("Version");
    expect(screen.getByText("Version 3").tagName).toBe("DD");
    expect(row.querySelector("dt")).toHaveTextContent("Version");
  });
});
