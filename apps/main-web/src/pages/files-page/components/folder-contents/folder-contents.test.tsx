// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Drive, FileListItem, FolderContentsState } from "../../../../files/types.js";
import { FolderContents } from "./folder-contents.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];

const ENTRY: FileListItem = fileListItemSchema.parse({
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: true,
  itemCount: 2,
});

const contentsWith = (overrides: Partial<FolderContentsState> = {}): FolderContentsState => ({
  items: [ENTRY],
  status: "ready",
  errorTextId: null,
  hasMore: false,
  isLoadingMore: false,
  loadMore: vi.fn(async () => undefined),
  refresh: vi.fn(async () => undefined),
  refreshQuietly: vi.fn(async () => undefined),
  ...overrides,
});

const renderContents = (phone: boolean, contents: FolderContentsState) =>
  render(
    <MemoryRouter>
      <FolderContents driveId={DRIVE_ID} contents={contents} phone={phone} />
    </MemoryRouter>,
  );

describe("FolderContents", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the phone list on a phone", () => {
    renderContents(true, contentsWith());

    expect(screen.getByTestId("files-list")).toBeInTheDocument();
    expect(screen.queryByTestId("files-table")).not.toBeInTheDocument();
  });

  it("shows the desktop table on a desktop", () => {
    renderContents(false, contentsWith());

    expect(screen.getByTestId("files-table")).toBeInTheDocument();
    expect(screen.queryByTestId("files-list")).not.toBeInTheDocument();
  });

  it("shows the empty text when the folder has no entries", () => {
    renderContents(false, contentsWith({ items: [] }));

    expect(screen.getByTestId("files-empty")).toHaveTextContent("This folder is empty.");
    expect(screen.queryByTestId("files-table")).not.toBeInTheDocument();
  });
});
