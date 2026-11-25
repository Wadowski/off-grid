// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfPreviewer } from "./pdf-previewer.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PdfPreviewer", () => {
  it("shows the object URL in a frame titled with the file name", () => {
    render(
      <PdfPreviewer objectUrl="blob:http://localhost/plan" name="Plan.pdf" download={vi.fn()} />,
    );

    const frame = screen.getByTitle("Preview of Plan.pdf");
    expect(frame).toHaveAttribute("src", "blob:http://localhost/plan");
    expect(frame).toHaveAttribute("data-testid", "file-preview-pdf");
  });

  it("still tries the frame when the browser does not say whether it has a PDF viewer", () => {
    vi.stubGlobal("navigator", { pdfViewerEnabled: undefined });

    render(
      <PdfPreviewer objectUrl="blob:http://localhost/plan" name="Plan.pdf" download={vi.fn()} />,
    );

    expect(screen.getByTitle("Preview of Plan.pdf")).toBeInTheDocument();
  });

  it("tells that the PDF can't be shown and offers Download when the browser has no PDF viewer", () => {
    vi.stubGlobal("navigator", { pdfViewerEnabled: false });
    const download = vi.fn();

    render(
      <PdfPreviewer objectUrl="blob:http://localhost/plan" name="Plan.pdf" download={download} />,
    );

    expect(screen.queryByTitle("Preview of Plan.pdf")).toBeNull();
    expect(screen.getByText("This PDF can't be shown here.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(download).toHaveBeenCalledOnce();
  });
});
