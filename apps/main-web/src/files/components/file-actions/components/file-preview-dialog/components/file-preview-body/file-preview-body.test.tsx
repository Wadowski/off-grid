// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFileContent } from "../../../../../../files-api.js";
import type { RegularFileEntry } from "../../../../../../types.js";
import { FilePreviewBody } from "./file-preview-body.js";

vi.mock("../../../../../../files-api.js", () => ({ getFileContent: vi.fn() }));

const IMAGE = {
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  name: "Beach.png",
  mimeType: "image/png",
} as RegularFileEntry;
const PDF = { ...IMAGE, name: "Plan.pdf", mimeType: "application/pdf" } as RegularFileEntry;

beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview");
  URL.revokeObjectURL = vi.fn();
});

afterEach(cleanup);

describe("FilePreviewBody", () => {
  it("shows a loading status while the content loads", () => {
    vi.mocked(getFileContent).mockReturnValue(new Promise<Blob>(() => undefined));

    render(<FilePreviewBody file={IMAGE} download={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading preview");
  });

  it("shows an image with the viewer of the image kind", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["x"], { type: "image/png" }));

    render(<FilePreviewBody file={IMAGE} download={vi.fn()} />);

    expect(await screen.findByRole("img", { name: "Beach.png" })).toHaveAttribute(
      "src",
      "blob:http://localhost/preview",
    );
  });

  it("shows a PDF with the viewer of the pdf kind", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["x"], { type: "application/pdf" }));

    render(<FilePreviewBody file={PDF} download={vi.fn()} />);

    expect(await screen.findByTitle("Preview of Plan.pdf")).toBeInTheDocument();
  });

  it("shows the error with Try again, and loads again on Try again", async () => {
    vi.mocked(getFileContent).mockRejectedValueOnce(new ApiError(404, "NOT_FOUND", "gone"));
    render(<FilePreviewBody file={IMAGE} download={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
    vi.mocked(getFileContent).mockResolvedValueOnce(new Blob(["x"], { type: "image/png" }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("img", { name: "Beach.png" })).toBeInTheDocument();
  });

  it("offers the download when the server does not send the file inline", async () => {
    const download = vi.fn();
    vi.mocked(getFileContent).mockResolvedValue(
      new Blob(["x"], { type: "application/octet-stream" }),
    );
    render(<FilePreviewBody file={IMAGE} download={download} />);

    expect(await screen.findByTestId("file-preview-unsupported")).toHaveTextContent(
      "This file type can't be previewed. Download it instead.",
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(download).toHaveBeenCalledOnce();
  });
});
