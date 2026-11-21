// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFile, listDrives } from "../../files/files-api.js";
import type { Drive } from "../../files/types.js";
import { FilesPage } from "./files-page.js";

vi.mock("../../files/files-api.js", () => ({
  getFile: vi.fn(),
  listDrives: vi.fn(),
}));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const FOLDER_PATH = `/files/${DRIVE_ID}/folder/${FOLDER_ID}`;
const DRIVE = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;
const FOLDER = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: true,
};
const FOLDER_BREADCRUMBS = [
  { kind: "drive", id: DRIVE_ID, name: "Personal" },
  { kind: "folder", id: FOLDER_ID, name: "Photos" },
];

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/files" element={<FilesPage />} />
        <Route path="/files/:driveId/folder/:folderId?" element={<FilesPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("FilesPage", () => {
  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
    vi.mocked(getFile).mockResolvedValue({
      file: FOLDER,
      breadcrumbs: FOLDER_BREADCRUMBS,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the Files heading and the placeholder on the index without loading data", () => {
    renderAt("/files");

    expect(screen.getByTestId("files-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(screen.getByText("Your drives and folders will appear here.")).toBeInTheDocument();
    expect(listDrives).not.toHaveBeenCalled();
  });

  it("shows the loading text while the folder is requested", () => {
    renderAt(FOLDER_PATH);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Folder path" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("shows the folder path and the placeholder once the folder is loaded", async () => {
    renderAt(FOLDER_PATH);

    await waitFor(() =>
      expect(screen.getByTestId("files-breadcrumb-current")).toHaveTextContent("Photos"),
    );
    expect(screen.getByRole("link", { name: "Personal" })).toBeInTheDocument();
    expect(screen.getByText("Your drives and folders will appear here.")).toBeInTheDocument();
  });

  it("shows only the not-found view when the folder cannot be shown", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));
    renderAt(FOLDER_PATH);

    await waitFor(() => expect(screen.getByTestId("folder-not-found")).toBeInTheDocument());
    expect(screen.queryByRole("navigation", { name: "Folder path" })).not.toBeInTheDocument();
  });

  it("shows the error text when the folder cannot be loaded for another reason", async () => {
    vi.mocked(getFile).mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt(FOLDER_PATH);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Try again."),
    );
  });
});
