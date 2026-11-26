// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Drive, FileListItem } from "../../../../files/types.js";
import { FolderList } from "./folder-list.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const TRIP_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const UPDATED_AT = "2026-01-01T00:00:00.000Z";

const PHOTOS: FileListItem = fileListItemSchema.parse({
  id: PHOTOS_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  deletedAt: null,
  isFolder: true,
  itemCount: 2,
});

const TRIP: FileListItem = fileListItemSchema.parse({
  id: TRIP_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Trip.pdf",
  version: 1,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  deletedAt: null,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: VERSION_ID,
});

const LocationProbe = () => {
  const location = useLocation();
  return <p data-testid="probe">{location.pathname}</p>;
};

const renderList = (overrides: Partial<Parameters<typeof FolderList>[0]> = {}) => {
  const onLoadMore = vi.fn(async () => undefined);
  render(
    <MemoryRouter initialEntries={["/files"]}>
      <Routes>
        <Route
          path="/files"
          element={
            <FolderList
              driveId={DRIVE_ID}
              items={[PHOTOS, TRIP]}
              hasMore={false}
              isLoadingMore={false}
              onRename={vi.fn()}
              onDelete={vi.fn()}
              onLoadMore={onLoadMore}
              {...overrides}
            />
          }
        />
        <Route path="/files/:driveId/folder/:folderId" element={<LocationProbe />} />
        <Route path="/files/:driveId/file/:fileId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return { onLoadMore };
};

describe("FolderList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the entries in order as rows in a labelled list", () => {
    renderList();

    const list = screen.getByRole("list", { name: "Folder contents" });
    const rows = within(list).getAllByTestId("file-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Photos");
    expect(rows[1]).toHaveTextContent("Trip.pdf");
  });

  it("shows the item count of a folder and the size of a file", () => {
    renderList();

    expect(screen.getByTestId("file-item-count")).toHaveTextContent("2 items");
    expect(screen.getByTestId("file-size")).toBeInTheDocument();
  });

  it("opens a folder when its row is activated", () => {
    renderList();

    fireEvent.click(screen.getByRole("button", { name: /^Photos/ }));

    expect(screen.getByTestId("probe")).toHaveTextContent(`/files/${DRIVE_ID}/folder/${PHOTOS_ID}`);
  });

  it("opens the details of a file when its row is activated", () => {
    renderList();

    fireEvent.click(screen.getByRole("button", { name: /^Trip\.pdf/ }));

    expect(screen.getByTestId("probe")).toHaveTextContent(`/files/${DRIVE_ID}/file/${TRIP_ID}`);
  });

  it("shows a load more button only when another page exists and asks for it", () => {
    const { onLoadMore } = renderList({ hasMore: true });

    fireEvent.click(screen.getByTestId("files-load-more"));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("hides the load more button when the list has no more pages", () => {
    renderList({ hasMore: false });

    expect(screen.queryByTestId("files-load-more")).not.toBeInTheDocument();
  });
});
