// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { toFolderState } from "./to-folder-state.js";
import type { Drive, FileDetailsState, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const OTHER_DRIVE_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const refresh = vi.fn(async () => undefined);

const ROOT_CRUMB = { kind: "drive", id: DRIVE_ID, name: "Personal" } as const;

const detailsWith = (overrides: Partial<FileDetailsState>): FileDetailsState => ({
  file: null,
  breadcrumbs: [],
  status: "ready",
  errorTextId: null,
  refresh,
  refreshQuietly: refresh,
  ...overrides,
});

const folderEntry = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  name: "Photos",
  isFolder: true,
} as unknown as FileEntry;

describe("toFolderState", () => {
  it("is loading while the details load", () => {
    const state = toFolderState(detailsWith({ status: "loading" }), DRIVE_ID, FOLDER_ID);

    expect(state).toEqual({
      status: "loading",
      driveId: DRIVE_ID,
      folderId: FOLDER_ID,
      breadcrumbs: [],
      errorTextId: null,
      refresh,
    });
  });

  it("is ready with the folder appended to its path", () => {
    const state = toFolderState(
      detailsWith({ file: folderEntry, breadcrumbs: [ROOT_CRUMB] }),
      DRIVE_ID,
      FOLDER_ID,
    );

    expect(state.status).toBe("ready");
    expect(state.breadcrumbs).toEqual([
      ROOT_CRUMB,
      { kind: "folder", id: FOLDER_ID, name: "Photos" },
    ]);
    expect(state.refresh).toBe(refresh);
  });

  it("is not found when the API hides the folder with a 404", () => {
    const state = toFolderState(
      detailsWith({ status: "failed", errorTextId: "files.errors.notFound" }),
      DRIVE_ID,
      FOLDER_ID,
    );

    expect(state).toEqual({
      status: "not-found",
      driveId: DRIVE_ID,
      folderId: FOLDER_ID,
      breadcrumbs: [],
      errorTextId: null,
      refresh,
    });
  });

  it("is failed with the mapped error and a refresh when the details cannot load", () => {
    const state = toFolderState(
      detailsWith({ status: "failed", errorTextId: "files.errors.failed" }),
      DRIVE_ID,
      FOLDER_ID,
    );

    expect(state.status).toBe("failed");
    expect(state.errorTextId).toBe("files.errors.failed");
    expect(state.refresh).toBe(refresh);
  });

  it("is not found when the details belong to another drive", () => {
    const state = toFolderState(
      detailsWith({ file: { ...folderEntry, driveId: OTHER_DRIVE_ID } as FileEntry }),
      DRIVE_ID,
      FOLDER_ID,
    );

    expect(state.status).toBe("not-found");
  });
});
