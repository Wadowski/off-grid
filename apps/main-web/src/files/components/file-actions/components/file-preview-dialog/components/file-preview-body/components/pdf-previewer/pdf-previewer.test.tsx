// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PdfPreviewer } from "./pdf-previewer.js";

afterEach(cleanup);

describe("PdfPreviewer", () => {
  it("shows the object URL in a frame titled with the file name", () => {
    render(<PdfPreviewer objectUrl="blob:http://localhost/plan" name="Plan.pdf" />);

    const frame = screen.getByTitle("Preview of Plan.pdf");
    expect(frame).toHaveAttribute("src", "blob:http://localhost/plan");
    expect(frame).toHaveAttribute("data-testid", "file-preview-pdf");
  });
});
