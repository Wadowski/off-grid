// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Drive, FileListItem } from "../../../../files/types.js";
import { FileGrid } from "./file-grid.js";
import type { FileGridProps } from "./types.js";

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

const renderGrid = (overrides: Partial<FileGridProps> = {}) => {
  const props: FileGridProps = {
    driveId: DRIVE_ID,
    items: [PHOTOS, TRIP],
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: vi.fn(async () => undefined),
    selectedId: null,
    onSelect: vi.fn(),
    ...overrides,
  };
  render(
    <MemoryRouter initialEntries={["/files"]}>
      <Routes>
        <Route path="/files" element={<FileGrid {...props} />} />
        <Route path="/files/:driveId/folder/:folderId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return props;
};

describe("FileGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows every entry as a card in the order given, folders first as given", () => {
    renderGrid();

    const cards = within(screen.getByRole("list", { name: "Folder contents" })).getAllByRole(
      "listitem",
    );
    expect(cards.map((card) => within(card).getByTestId("file-name").textContent)).toEqual([
      "Photos",
      "Trip.pdf",
    ]);
  });

  it("opens a folder when its card is activated", () => {
    renderGrid();

    const photosCard = screen.getAllByRole("listitem")[0] as HTMLElement;
    fireEvent.click(within(photosCard).getByTestId("file-card-activate"));

    expect(screen.getByTestId("probe")).toHaveTextContent(`/files/${DRIVE_ID}/folder/${PHOTOS_ID}`);
  });

  it("reports the file whose card is activated", () => {
    const props = renderGrid();

    fireEvent.click(
      within(screen.getAllByRole("listitem")[1] as HTMLElement).getByTestId("file-card-activate"),
    );

    expect(props.onSelect).toHaveBeenCalledWith(TRIP_ID);
  });

  it("marks the selected file card", () => {
    renderGrid({ selectedId: TRIP_ID });

    expect(screen.getAllByTestId("file-card")[1]).toHaveAttribute("data-selected", "true");
    expect(screen.getAllByTestId("file-card")[0]).toHaveAttribute("data-selected", "false");
  });

  it("asks for the next page when the load more button is used", () => {
    const props = renderGrid({ hasMore: true });

    fireEvent.click(screen.getByTestId("files-load-more"));

    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("hides the load more button when there are no more pages", () => {
    renderGrid({ hasMore: false });

    expect(screen.queryByTestId("files-load-more")).not.toBeInTheDocument();
  });
});
