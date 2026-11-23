// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFile } from "../../files/files-api.js";
import { FileDetailsPage } from "./file-details-page.js";

vi.mock("../../files/files-api.js", () => ({
  getFile: vi.fn(),
}));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const FILE_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const OTHER_DRIVE_ID = "1f2e3d4c-5b6a-4978-8a7b-6c5d4e3f2a1b";

const timestamps = {
  createdAt: "2026-03-01T08:00:00.000Z",
  updatedAt: "2026-03-04T05:06:07.000Z",
  deletedAt: null,
};

const regularFile = (overrides: Record<string, unknown> = {}) => ({
  file: {
    id: FILE_ID,
    driveId: DRIVE_ID,
    parentId: PHOTOS_ID,
    name: "Beach.jpg",
    version: 2,
    isFolder: false,
    mimeType: "image/jpeg",
    size: 2048,
    currentVersionId: VERSION_ID,
    ...timestamps,
    ...overrides,
  },
  breadcrumbs: [
    { kind: "drive", id: DRIVE_ID, name: "Personal" },
    { kind: "folder", id: PHOTOS_ID, name: "Photos" },
    { kind: "folder", id: FILE_ID, name: "Beach.jpg" },
  ],
});

const folderDetails = () => ({
  file: {
    id: PHOTOS_ID,
    driveId: DRIVE_ID,
    parentId: null,
    name: "Photos",
    version: 1,
    isFolder: true,
    ...timestamps,
  },
  breadcrumbs: [
    { kind: "drive", id: DRIVE_ID, name: "Personal" },
    { kind: "folder", id: PHOTOS_ID, name: "Photos" },
  ],
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/files/:driveId/file/:fileId" element={<FileDetailsPage />} />
        <Route path="/files/:driveId/folder/:folderId" element={<p>Folder page</p>} />
        <Route path="/files" element={<p>Files home</p>} />
      </Routes>
    </MemoryRouter>,
  );

const FILE_PATH = `/files/${DRIVE_ID}/file/${FILE_ID}`;

describe("FileDetailsPage", () => {
  beforeEach(() => {
    vi.mocked(getFile).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the loading text, then the file details", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    renderAt(FILE_PATH);

    expect(screen.getByTestId("file-details-loading")).toBeInTheDocument();
    expect(await screen.findByTestId("file-details-ready")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-name")).toHaveTextContent("Beach.jpg");
    expect(screen.getByRole("link", { name: "Back to Photos" })).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder/${PHOTOS_ID}`,
    );
  });

  it("shows the mapped error and retries the request", async () => {
    vi.mocked(getFile)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(regularFile() as never);
    renderAt(FILE_PATH);

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByTestId("file-details-ready")).toBeInTheDocument();
  });

  it("shows File not found when the API reports the file as missing", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found when the file is in another drive", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile({ driveId: OTHER_DRIVE_ID }) as never);
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found for a trashed file", async () => {
    vi.mocked(getFile).mockResolvedValue(
      regularFile({ deletedAt: "2026-03-05T00:00:00.000Z" }) as never,
    );
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found for an id that is not valid", async () => {
    renderAt(`/files/${DRIVE_ID}/file/not-an-id`);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
    expect(getFile).not.toHaveBeenCalled();
  });

  it("redirects a folder id to the folder page", async () => {
    vi.mocked(getFile).mockResolvedValue(folderDetails() as never);
    renderAt(`/files/${DRIVE_ID}/file/${PHOTOS_ID}`);

    expect(await screen.findByText("Folder page")).toBeInTheDocument();
  });

  it("links a file at the drive root back to the drive root", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile({ parentId: null }) as never);
    vi.mocked(getFile).mockResolvedValue({
      ...regularFile({ parentId: null }),
      breadcrumbs: [
        { kind: "drive", id: DRIVE_ID, name: "Personal" },
        { kind: "folder", id: FILE_ID, name: "Beach.jpg" },
      ],
    } as never);
    renderAt(FILE_PATH);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Back to Personal" })).toHaveAttribute(
        "href",
        `/files/${DRIVE_ID}/folder`,
      ),
    );
  });
});
