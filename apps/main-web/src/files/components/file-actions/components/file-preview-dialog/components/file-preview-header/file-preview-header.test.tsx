// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilePreviewHeader } from "./file-preview-header.js";

afterEach(cleanup);

const renderHeader = (overrides: { isDownloading?: boolean } = {}) => {
  const onDownload = vi.fn();
  const onClose = vi.fn();
  render(
    <FilePreviewHeader
      nameId="preview-name"
      name="Beach.png"
      kind="image"
      isDownloading={overrides.isDownloading ?? false}
      closeRef={null}
      onDownload={onDownload}
      onClose={onClose}
    />,
  );
  return { onDownload, onClose };
};

describe("FilePreviewHeader", () => {
  it("shows the file name as the label target", () => {
    renderHeader();

    expect(screen.getByTestId("file-preview-name")).toHaveAttribute("id", "preview-name");
    expect(screen.getByTestId("file-preview-name")).toHaveTextContent("Beach.png");
  });

  it("downloads and closes through icon buttons named by their labels", () => {
    const { onDownload, onClose } = renderHeader();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    fireEvent.click(screen.getByRole("button", { name: "Close preview" }));

    expect(onDownload).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("disables the download while it runs", () => {
    renderHeader({ isDownloading: true });

    const button = screen.getByRole("button", { name: "Download" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
