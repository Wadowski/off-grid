// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Drive, FileListItem } from "../../../../files/types.js";
import { FileList } from "./file-list.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const TRIP_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const NOTES_ID = "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const UPDATED_AT = "2026-01-01T00:00:00.000Z";

const fileItem = (id: string, name: string): FileListItem =>
  fileListItemSchema.parse({
    id,
    driveId: DRIVE_ID,
    parentId: null,
    name,
    version: 1,
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
    deletedAt: null,
    isFolder: false,
    mimeType: "application/pdf",
    size: 2048,
    currentVersionId: VERSION_ID,
  });

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

const TRIP = fileItem(TRIP_ID, "Trip.pdf");
const NOTES = fileItem(NOTES_ID, "Notes.pdf");

const LocationProbe = () => {
  const location = useLocation();
  return <p data-testid="probe">{location.pathname}</p>;
};

const renderList = (overrides: Partial<Parameters<typeof FileList>[0]> = {}) => {
  const onLoadMore = vi.fn(async () => undefined);
  render(
    <MemoryRouter initialEntries={["/files"]}>
      <Routes>
        <Route
          path="/files"
          element={
            <FileList
              driveId={DRIVE_ID}
              items={[PHOTOS, TRIP, NOTES]}
              hasMore={false}
              isLoadingMore={false}
              onLoadMore={onLoadMore}
              {...overrides}
            />
          }
        />
        <Route path="/files/:driveId/folder/:folderId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return { onLoadMore };
};

const rowNamed = (name: string) =>
  screen
    .getAllByTestId("file-table-row")
    .find((row) => within(row).queryByTestId("file-table-name")?.textContent === name);

describe("FileList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the entries in the order given as rows of the table", () => {
    renderList();

    const rows = within(screen.getByRole("table", { name: "Folder contents" })).getAllByTestId(
      "file-table-row",
    );
    expect(rows.map((row) => within(row).getByTestId("file-table-name").textContent)).toEqual([
      "Photos",
      "Trip.pdf",
      "Notes.pdf",
    ]);
  });

  it("opens a folder when its row is activated", () => {
    renderList();

    fireEvent.click(within(rowNamed("Photos") as HTMLElement).getByRole("button"));

    expect(screen.getByTestId("probe")).toHaveTextContent(`/files/${DRIVE_ID}/folder/${PHOTOS_ID}`);
  });

  it("selects a file row without leaving the list", () => {
    renderList();

    fireEvent.click(within(rowNamed("Trip.pdf") as HTMLElement).getByRole("button"));

    expect(rowNamed("Trip.pdf")).toHaveAttribute("data-selected", "true");
    expect(screen.queryByTestId("probe")).not.toBeInTheDocument();
  });

  it("moves the selection when another file row is selected", () => {
    renderList();

    fireEvent.click(within(rowNamed("Trip.pdf") as HTMLElement).getByRole("button"));
    fireEvent.click(within(rowNamed("Notes.pdf") as HTMLElement).getByRole("button"));

    expect(rowNamed("Notes.pdf")).toHaveAttribute("data-selected", "true");
    expect(rowNamed("Trip.pdf")).toHaveAttribute("data-selected", "false");
  });

  it("asks for the next page when the load more button is used", () => {
    const { onLoadMore } = renderList({ hasMore: true });

    fireEvent.click(screen.getByTestId("files-load-more"));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("hides the load more button when the list has no more pages", () => {
    renderList({ hasMore: false });

    expect(screen.queryByTestId("files-load-more")).not.toBeInTheDocument();
  });

  it("disables the load more button and marks the table busy while loading", () => {
    renderList({ hasMore: true, isLoadingMore: true });

    expect(screen.getByTestId("files-load-more")).toBeDisabled();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
  });
});
