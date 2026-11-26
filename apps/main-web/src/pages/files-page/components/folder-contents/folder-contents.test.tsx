// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  Drive,
  FileEntry,
  FileListItem,
  FilesView,
  FolderContentsState,
} from "../../../../files/types.js";
import { webFilesClient } from "../../../../api/web-api-client.js";
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
  refreshQuietly: vi.fn(async () => undefined),
  removeItem: vi.fn(),
  replaceItem: vi.fn(),
  ...overrides,
});

const renderContents = (
  phone: boolean,
  contents: FolderContentsState,
  view: FilesView = "list",
  selectedId: FileListItem["id"] | null = null,
  onSelect = vi.fn(),
) =>
  render(
    <MemoryRouter>
      <FolderContents
        drives={[]}
        folderId={null}
        driveId={DRIVE_ID}
        contents={contents}
        phone={phone}
        view={view}
        selectedId={selectedId}
        onSelect={onSelect}
        onEntryLeft={vi.fn()}
        onEntryTrashed={vi.fn()}
        onEntryRenamed={vi.fn()}
      />
    </MemoryRouter>,
  );

const activatorOf = (name: string) =>
  screen
    .getAllByTestId("file-table-row")
    .find((row) => row.textContent?.includes(name))
    ?.querySelector<HTMLElement>('[data-testid="file-table-activate"]');

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

  it("shows each entry as a card in grid view", () => {
    renderContents(false, contentsWith(), "grid");

    const grid = screen.getByTestId("files-file-grid");
    expect(within(grid).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByTestId("file-table-row")).not.toBeInTheDocument();
  });

  it("keeps the selected file when the view changes", () => {
    const { rerender } = renderContents(
      false,
      contentsWith({ items: [FILE_ENTRY] }),
      "list",
      FILE_ENTRY.id,
    );

    rerender(
      <MemoryRouter>
        <FolderContents
          drives={[]}
          folderId={null}
          driveId={DRIVE_ID}
          contents={contentsWith({ items: [FILE_ENTRY] })}
          phone={false}
          view="grid"
          selectedId={FILE_ENTRY.id}
          onSelect={vi.fn()}
          onEntryLeft={vi.fn()}
          onEntryTrashed={vi.fn()}
          onEntryRenamed={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("file-card")).toHaveAttribute("data-selected", "true");
  });

  it("reports the file whose row is activated on a desktop", () => {
    const onSelect = vi.fn();
    renderContents(false, contentsWith(), "list", null, onSelect);

    fireEvent.click(activatorOf("Trip.pdf") as HTMLElement);

    expect(onSelect).toHaveBeenCalledWith(FILE_ENTRY.id);
  });

  it("does not report a selection when a folder row is opened", () => {
    const onSelect = vi.fn();
    renderContents(false, contentsWith(), "list", null, onSelect);

    fireEvent.click(activatorOf("Photos") as HTMLElement);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks the row of the selected file", () => {
    renderContents(false, contentsWith(), "list", FILE_ENTRY.id);

    const row = screen
      .getAllByTestId("file-table-row")
      .find((candidate) => candidate.textContent?.includes("Trip.pdf"));
    expect(row).toHaveAttribute("data-selected", "true");
  });

  it("removes a file moved to the trash from the list and tells the person it was moved", async () => {
    const removeItem = vi.fn();
    const onEntryTrashed = vi.fn();
    vi.spyOn(webFilesClient, "trashFile").mockResolvedValue({} as FileEntry);
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    render(
      <MemoryRouter>
        <FolderContents
          drives={[]}
          folderId={null}
          driveId={DRIVE_ID}
          contents={contentsWith({ removeItem })}
          phone={false}
          view="list"
          selectedId={null}
          onSelect={vi.fn()}
          onEntryLeft={vi.fn()}
          onEntryTrashed={onEntryTrashed}
          onEntryRenamed={vi.fn()}
        />
      </MemoryRouter>,
    );

    const row = screen.getByRole("button", { name: "Actions for Trip.pdf" }).closest("tr");
    fireEvent.click(screen.getByRole("button", { name: "Actions for Trip.pdf" }));
    fireEvent.click(within(row as HTMLElement).getByTestId("file-action-delete"));
    fireEvent.click(screen.getByTestId("delete-entry-confirm"));

    expect(await screen.findByRole("status")).toHaveTextContent(
      '"Trip.pdf" was moved to the trash.',
    );
    expect(removeItem).toHaveBeenCalledWith(FILE_ENTRY.id);
    expect(onEntryTrashed).toHaveBeenCalledWith(FILE_ENTRY.id);
  });

  it("keeps the move-to-trash confirmation open when the layout switches to the phone list", () => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    const contents = contentsWith({ items: [FILE_ENTRY] });
    const { rerender } = renderContents(false, contents);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Trip.pdf" }));
    fireEvent.click(screen.getByTestId("file-action-delete"));

    rerender(
      <MemoryRouter>
        <FolderContents
          drives={[]}
          folderId={null}
          driveId={DRIVE_ID}
          contents={contents}
          phone
          view="list"
          selectedId={null}
          onSelect={vi.fn()}
          onEntryLeft={vi.fn()}
          onEntryTrashed={vi.fn()}
          onEntryRenamed={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("files-list")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toHaveTextContent("Trip.pdf");
  });

  it("closes the confirmation without a call when cancelled", () => {
    const trash = vi.spyOn(webFilesClient, "trashFile");
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
    renderContents(false, contentsWith({ items: [FILE_ENTRY] }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Trip.pdf" }));
    fireEvent.click(screen.getByTestId("file-action-delete"));

    fireEvent.click(screen.getByTestId("delete-entry-cancel"));

    expect(trash).not.toHaveBeenCalled();
    expect(screen.queryByTestId("delete-entry-dialog")).not.toBeInTheDocument();
  });

  it("opens the rename dialog for the entry chosen from its actions menu", () => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    render(
      <MemoryRouter>
        <FolderContents
          driveId={DRIVE_ID}
          folderId={null}
          contents={contentsWith()}
          phone={false}
          view="list"
          selectedId={null}
          onSelect={vi.fn()}
          drives={[]}
          onEntryLeft={vi.fn()}
          onEntryTrashed={vi.fn()}
          onEntryRenamed={vi.fn()}
        />
      </MemoryRouter>,
    );

    const row = screen.getByRole("button", { name: "Actions for Trip.pdf" }).closest("tr");
    fireEvent.click(screen.getByRole("button", { name: "Actions for Trip.pdf" }));
    fireEvent.click(within(row as HTMLElement).getByTestId("file-action-rename"));

    expect(screen.getByTestId("rename-entry-name")).toHaveValue("Trip.pdf");
  });
});
