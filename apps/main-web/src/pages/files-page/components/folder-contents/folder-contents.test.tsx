// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFile } from "../../../../files/files-api.js";
import type { Drive, FileListItem, FolderContentsState } from "../../../../files/types.js";
import { FolderContents } from "./folder-contents.js";

vi.mock("../../../../files/files-api.js", () => ({
  getFile: vi.fn(),
}));

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

const FILE_ENTRY: FileListItem = fileListItemSchema.parse({
  id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Trip.pdf",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
});

const FILE_DETAILS = {
  file: { ...FILE_ENTRY },
  breadcrumbs: [{ kind: "drive", id: DRIVE_ID, name: "Personal" }],
};

const contentsWith = (
  overrides: Partial<FolderContentsState> = {},
  items: readonly FileListItem[] = [ENTRY, FILE_ENTRY],
): FolderContentsState => ({
  items,
  status: "ready",
  errorTextId: null,
  hasMore: false,
  isLoadingMore: false,
  loadMore: vi.fn(async () => undefined),
  refresh: vi.fn(async () => undefined),
  ...overrides,
});

const renderContents = (phone: boolean, contents: FolderContentsState) =>
  render(
    <MemoryRouter>
      <FolderContents driveId={DRIVE_ID} contents={contents} phone={phone} />
    </MemoryRouter>,
  );

const activatorOf = (name: string) =>
  screen
    .getAllByTestId("file-table-row")
    .find((row) => row.textContent?.includes(name))
    ?.querySelector<HTMLElement>('[data-testid="file-table-activate"]');

describe("FolderContents", () => {
  beforeEach(() => {
    vi.mocked(getFile).mockResolvedValue(FILE_DETAILS as never);
  });

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

  it("opens the details panel beside the table when a file row is selected on a desktop", async () => {
    renderContents(false, contentsWith());

    fireEvent.click(activatorOf("Trip.pdf") as HTMLElement);

    expect(await screen.findByTestId("file-details-panel")).toBeInTheDocument();
    expect(getFile).toHaveBeenCalledWith(FILE_ENTRY.id);
  });

  it("does not open the details panel when a folder row is opened", () => {
    renderContents(false, contentsWith());

    fireEvent.click(activatorOf("Photos") as HTMLElement);

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
  });

  it("closes the panel and clears the selection when the close button is pressed", async () => {
    renderContents(false, contentsWith());
    fireEvent.click(activatorOf("Trip.pdf") as HTMLElement);
    await screen.findByTestId("file-details-panel-name");

    fireEvent.click(screen.getByTestId("file-details-panel-close"));

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
    expect(activatorOf("Trip.pdf")?.getAttribute("aria-current")).toBeNull();
  });

  it("closes the panel on Escape and returns focus to the selected row", async () => {
    renderContents(false, contentsWith());
    fireEvent.click(activatorOf("Trip.pdf") as HTMLElement);
    await screen.findByTestId("file-details-panel-name");

    fireEvent.keyDown(screen.getByTestId("file-details-panel"), { key: "Escape" });

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
    await waitFor(() => expect(activatorOf("Trip.pdf")).toHaveFocus());
  });

  it("hides the panel when the layout switches to a phone", async () => {
    const view = renderContents(false, contentsWith());
    fireEvent.click(activatorOf("Trip.pdf") as HTMLElement);
    await screen.findByTestId("file-details-panel");

    view.rerender(
      <MemoryRouter>
        <FolderContents driveId={DRIVE_ID} contents={contentsWith()} phone />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
  });
});
