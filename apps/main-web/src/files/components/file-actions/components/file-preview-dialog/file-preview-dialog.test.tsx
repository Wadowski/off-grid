// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFileContent } from "../../../../files-api.js";
import type { FileDownload, RegularFileEntry } from "../../../../types.js";
import { FilePreviewDialog } from "./file-preview-dialog.js";

vi.mock("../../../../files-api.js", () => ({ getFileContent: vi.fn() }));

const IMAGE = {
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  name: "Beach.png",
  mimeType: "image/png",
} as RegularFileEntry;
const IDLE_DOWNLOAD: FileDownload = { status: "idle", errorTextId: null, download: vi.fn() };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getFileContent).mockResolvedValue(new Blob(["x"], { type: "image/png" }));
  URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview");
  URL.revokeObjectURL = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

afterEach(cleanup);

describe("FilePreviewDialog", () => {
  it("opens as a modal dialog named by the file name and moves focus to Close", async () => {
    render(<FilePreviewDialog file={IMAGE} download={IDLE_DOWNLOAD} onClose={vi.fn()} />);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: "Beach.png" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close preview" })).toHaveFocus();
    expect(await screen.findByRole("img", { name: "Beach.png" })).toBeInTheDocument();
  });

  it("closes the dialog and reports it when Close is pressed", async () => {
    const onClose = vi.fn();
    render(<FilePreviewDialog file={IMAGE} download={IDLE_DOWNLOAD} onClose={onClose} />);
    await screen.findByRole("img", { name: "Beach.png" });

    fireEvent.click(screen.getByRole("button", { name: "Close preview" }));

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("downloads from the header", async () => {
    const download = vi.fn();
    render(
      <FilePreviewDialog
        file={IMAGE}
        download={{ ...IDLE_DOWNLOAD, download }}
        onClose={vi.fn()}
      />,
    );
    await screen.findByRole("img", { name: "Beach.png" });

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(download).toHaveBeenCalledOnce();
  });

  it("keeps Escape from reaching the parent key handler", async () => {
    const parentKeyDown = vi.fn();
    render(
      <div onKeyDown={parentKeyDown}>
        <FilePreviewDialog file={IMAGE} download={IDLE_DOWNLOAD} onClose={vi.fn()} />
      </div>,
    );
    await screen.findByRole("img", { name: "Beach.png" });

    fireEvent.keyDown(screen.getByRole("button", { name: "Close preview" }), { key: "Escape" });

    expect(parentKeyDown).not.toHaveBeenCalled();
  });

  it("shows a download failure inside the dialog", async () => {
    render(
      <FilePreviewDialog
        file={IMAGE}
        download={{ ...IDLE_DOWNLOAD, status: "failed", errorTextId: "files.errors.failed" }}
        onClose={vi.fn()}
      />,
    );
    await screen.findByRole("img", { name: "Beach.png" });

    expect(screen.getByTestId("file-preview-download-error")).toHaveTextContent(
      "Something went wrong. Try again.",
    );
  });
});
