// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFileContent } from "../../files-api.js";
import type { RegularFileEntry } from "../../types.js";
import { FileActions } from "./file-actions.js";

vi.mock("../../files-api.js", () => ({ getFileContent: vi.fn() }));

const FILE = {
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  name: "Beach.png",
  mimeType: "image/png",
} as RegularFileEntry;
const NOTES = { ...FILE, name: "Notes.txt", mimeType: "text/plain" } as RegularFileEntry;

beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:http://localhost/x");
  URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

afterEach(cleanup);

describe("FileActions", () => {
  it("offers icon-only Download and Preview buttons named by their labels for an image", () => {
    render(<FileActions file={FILE} />);

    const download = screen.getByRole("button", { name: "Download" });
    const preview = screen.getByRole("button", { name: "Preview" });
    expect(download).toHaveTextContent("");
    expect(preview).toHaveTextContent("");
    expect(preview).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("offers Download only for a file that cannot be previewed", () => {
    render(<FileActions file={NOTES} />);

    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument();
  });

  it("saves the attachment when Download is pressed", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["hello"]));
    render(<FileActions file={NOTES} />);

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce());
    expect(getFileContent).toHaveBeenCalledWith(NOTES.id, { disposition: "attachment" });
  });

  it("announces the download and disables the button while it runs", async () => {
    vi.mocked(getFileContent).mockReturnValue(new Promise<Blob>(() => undefined));
    render(<FileActions file={NOTES} />);

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Downloading Notes.txt");
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  });

  it("shows the error notice when the download fails", async () => {
    vi.mocked(getFileContent).mockRejectedValue(new ApiError(404, "NOT_FOUND", "gone"));
    render(<FileActions file={NOTES} />);

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(await screen.findByTestId("file-details-download-error")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
  });

  it("opens the preview dialog on Preview and removes it when it closes", async () => {
    vi.mocked(getFileContent).mockResolvedValue(new Blob(["x"], { type: "image/png" }));
    render(<FileActions file={FILE} />);

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.getByRole("dialog", { name: "Beach.png" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Close preview" }));

    expect(screen.queryByTestId("file-preview-dialog")).not.toBeInTheDocument();
  });
});
