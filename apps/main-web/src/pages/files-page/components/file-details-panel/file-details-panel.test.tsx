// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFile } from "../../../../files/files-api.js";
import type { Drive, FileEntry } from "../../../../files/types.js";
import { FileDetailsPanel } from "./file-details-panel.js";

vi.mock("../../../../files/files-api.js", () => ({
  getFile: vi.fn(),
}));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileEntry["id"];
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";

const REGULAR_FILE = {
  id: FILE_ID,
  driveId: DRIVE_ID,
  parentId: FOLDER_ID,
  name: "Trip.pdf",
  version: 3,
  createdAt: "2026-03-01T08:00:00.000Z",
  updatedAt: "2026-03-04T05:06:07.000Z",
  deletedAt: null,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: VERSION_ID,
};

const FOLDER_ENTRY = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: true,
  itemCount: 0,
};

const BREADCRUMBS = [
  { kind: "drive", id: DRIVE_ID, name: "Personal" },
  { kind: "folder", id: FOLDER_ID, name: "Photos" },
];

const renderPanel = (onClose = vi.fn()) =>
  render(<FileDetailsPanel fileId={FILE_ID} onClose={onClose} />);

describe("FileDetailsPanel", () => {
  beforeEach(() => {
    vi.mocked(getFile).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a loading state until the details arrive", () => {
    vi.mocked(getFile).mockReturnValue(new Promise(() => undefined) as never);

    renderPanel();

    expect(screen.getByTestId("file-details-panel-loading")).toHaveTextContent("Loading...");
    expect(screen.queryByTestId("file-details-panel-name")).not.toBeInTheDocument();
  });

  it("shows the name, type, size, dates and location of the file", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);

    renderPanel();

    expect(await screen.findByTestId("file-details-panel-name")).toHaveTextContent("Trip.pdf");
    expect(screen.getByTestId("file-details-property-type")).toHaveTextContent("PDF");
    expect(screen.getByTestId("file-details-property-size")).toHaveTextContent("2.0 KB");
    expect(screen.getByTestId("file-details-property-modified")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-property-created")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-property-location")).toHaveTextContent(
      "Personal › Photos",
    );
  });

  it("shows no owner and no version row", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);

    renderPanel();

    await screen.findByTestId("file-details-panel-name");
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();
    expect(screen.queryByTestId("file-details-property-version")).not.toBeInTheDocument();
  });

  it("labels the region with the file name once the details are ready", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);

    renderPanel();

    expect(await screen.findByRole("region", { name: "Trip.pdf" })).toBeInTheDocument();
  });

  it("shows the file actions once the details are ready and not while they load", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);

    renderPanel();

    expect(screen.queryByTestId("file-actions")).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Download" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
  });

  it("shows no file actions when the details fail", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));

    renderPanel();

    await screen.findByTestId("file-details-panel-error");
    expect(screen.queryByTestId("file-actions")).not.toBeInTheDocument();
  });

  it("shows a not-found message when the file no longer exists", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));

    renderPanel();

    expect(await screen.findByTestId("file-details-panel-error")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
  });

  it("shows an error and retries the request when the user asks", async () => {
    vi.mocked(getFile)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);

    renderPanel();

    expect(await screen.findByTestId("file-details-panel-error")).toHaveTextContent(
      "Something went wrong. Try again.",
    );
    fireEvent.click(screen.getByTestId("file-details-panel-retry"));

    expect(await screen.findByTestId("file-details-panel-name")).toHaveTextContent("Trip.pdf");
    expect(getFile).toHaveBeenCalledTimes(2);
  });

  it("shows the folder message when the selected entry is a folder", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: FOLDER_ENTRY, breadcrumbs: [] } as never);

    renderPanel();

    expect(await screen.findByTestId("file-details-panel-error")).toHaveTextContent(
      "This is a folder, not a file.",
    );
  });

  it("calls onClose when the close button is pressed", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);
    const onClose = vi.fn();

    renderPanel(onClose);
    await screen.findByTestId("file-details-panel-name");
    fireEvent.click(screen.getByTestId("file-details-panel-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed inside the panel", async () => {
    vi.mocked(getFile).mockResolvedValue({ file: REGULAR_FILE, breadcrumbs: BREADCRUMBS } as never);
    const onClose = vi.fn();

    renderPanel(onClose);
    await waitFor(() => expect(screen.getByTestId("file-details-panel-name")).toBeInTheDocument());
    fireEvent.keyDown(screen.getByTestId("file-details-panel"), { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
