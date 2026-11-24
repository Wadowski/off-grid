// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FileSummary } from "./file-summary.js";

describe("FileSummary", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the file name and its kind label", () => {
    render(<FileSummary name="Trip.pdf" kind="pdf" />);

    expect(screen.getByTestId("file-details-name")).toHaveTextContent("Trip.pdf");
    expect(screen.getByTestId("file-details-kind")).toHaveTextContent("PDF");
  });
});
