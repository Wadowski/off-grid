// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFile, listDrives } from "./files-api.js";
import { useCurrentFolder } from "./use-current-folder.js";
import type { Drive, FileDetails, FileEntry } from "./types.js";

vi.mock("./files-api.js", () => ({
  getFile: vi.fn(),
  listDrives: vi.fn(),
}));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const OTHER_DRIVE_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const MISSING_FOLDER_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const DRIVE: Drive = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
};
const FOLDER_BREADCRUMBS = [
  { kind: "drive", id: DRIVE_ID, name: "Personal" },
  { kind: "folder", id: FOLDER_ID, name: "Photos" },
] as FileDetails["breadcrumbs"];
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

const renderAt = (path: string) =>
  renderHook(() => useCurrentFolder(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: "/files/:driveId/folder/:folderId?", element: children }),
        ),
      ),
  });

const folderPath = (driveId: Drive["id"], folderId: string) =>
  `/files/${driveId}/folder/${folderId}`;

const rootPath = (driveId: Drive["id"]) => `/files/${driveId}/folder`;

describe("useCurrentFolder", () => {
  beforeEach(() => {
    vi.mocked(getFile).mockReset();
    vi.mocked(listDrives).mockReset();
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
  });

  it("shows the drive root with the drive as its only crumb", async () => {
    const { result } = renderAt(rootPath(DRIVE_ID));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.breadcrumbs).toEqual([{ kind: "drive", id: DRIVE_ID, name: "Personal" }]);
    expect(getFile).not.toHaveBeenCalled();
  });

  it("is not found at the drive root when the drive is not listed", async () => {
    const { result } = renderAt(rootPath(OTHER_DRIVE_ID));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("shows the folder with the breadcrumbs from the file details", async () => {
    vi.mocked(getFile).mockResolvedValue({
      file: FOLDER as FileEntry,
      breadcrumbs: FOLDER_BREADCRUMBS,
    });

    const { result } = renderAt(folderPath(DRIVE_ID, FOLDER_ID));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.breadcrumbs).toEqual(FOLDER_BREADCRUMBS);
    expect(result.current.driveId).toBe(DRIVE_ID);
  });

  it("is not found when the folder id is malformed, without a request", async () => {
    const { result } = renderAt(`/files/${DRIVE_ID}/folder/not-an-id`);

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    expect(getFile).not.toHaveBeenCalled();
  });

  it("is not found when the drive id is malformed, without a request", async () => {
    const { result } = renderAt(`/files/junk/folder/${FOLDER_ID}`);

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    expect(getFile).not.toHaveBeenCalled();
  });

  it("is not found when the API reports the folder as missing", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));

    const { result } = renderAt(folderPath(DRIVE_ID, MISSING_FOLDER_ID));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("is not found when the id belongs to a file, not a folder", async () => {
    vi.mocked(getFile).mockResolvedValue({
      file: {
        ...FOLDER,
        isFolder: false,
        mimeType: "application/pdf",
        size: 1,
        currentVersionId: FOLDER_ID,
      } as unknown as FileEntry,
      breadcrumbs: FOLDER_BREADCRUMBS,
    });

    const { result } = renderAt(folderPath(DRIVE_ID, FOLDER_ID));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("is not found when the folder belongs to another drive than the one in the address", async () => {
    vi.mocked(getFile).mockResolvedValue({
      file: { ...FOLDER, driveId: OTHER_DRIVE_ID } as FileEntry,
      breadcrumbs: FOLDER_BREADCRUMBS,
    });

    const { result } = renderAt(folderPath(DRIVE_ID, FOLDER_ID));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("reports failure with the error text when the request fails for another reason", async () => {
    vi.mocked(getFile).mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderAt(folderPath(DRIVE_ID, FOLDER_ID));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.failed");
  });
});
