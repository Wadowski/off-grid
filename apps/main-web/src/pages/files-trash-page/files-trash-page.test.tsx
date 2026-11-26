// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  emptyDriveTrash,
  listDriveTrash,
  listDrives,
  purgeFile,
  restoreFile,
} from "../../files/files-api.js";
import type { Drive, FileListItem, FileListPage } from "../../files/types.js";
import { FilesLayout } from "../../layouts/files-layout/files-layout.js";
import { FilesTrashPage } from "./files-trash-page.js";

vi.mock("../../files/files-api.js", () => ({
  listDrives: vi.fn(),
  listDriveTrash: vi.fn(),
  restoreFile: vi.fn(),
  purgeFile: vi.fn(),
  emptyDriveTrash: vi.fn(),
}));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const TRASH_PATH = `/files/${DRIVE_ID}/trash`;
const PHONE_QUERY = "(max-width: 767px)";
const DRIVE = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;
const TIMESTAMP = "2026-01-02T09:00:00.000Z";
const RECEIPT = {
  id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Old receipt.pdf",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: TIMESTAMP,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
} as FileListItem;
const HOLIDAY = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Holiday",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: TIMESTAMP,
  isFolder: true,
  itemCount: 1,
} as FileListItem;
const INSIDE_HOLIDAY = {
  ...RECEIPT,
  id: "3a4b5c6d-7e8f-4a9b-8c0d-1e2f3a4b5c6d",
  parentId: FOLDER_ID,
  name: "sunset.jpg",
} as FileListItem;
const PAGE = (items: FileListItem[]): FileListPage =>
  ({ items, breadcrumbs: [], nextCursor: null }) as FileListPage;

const withPhoneWidth = (isPhone: boolean) => {
  const original = window.matchMedia;
  window.matchMedia = (query: string) => ({
    ...original(query),
    matches: isPhone && query === PHONE_QUERY,
  });
  return () => {
    window.matchMedia = original;
  };
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/files" element={<FilesLayout />}>
          <Route path=":driveId/trash" element={<FilesTrashPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FilesTrashPage", () => {
  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([HOLIDAY, RECEIPT, INSIDE_HOLIDAY]));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists the top items of the trash with a Restore button each and no load more", async () => {
    renderAt(TRASH_PATH);

    expect(await screen.findByRole("button", { name: "Restore Holiday" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restore Old receipt.pdf" })).toBeInTheDocument();
    expect(screen.queryByText("sunset.jpg")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    expect(listDriveTrash).toHaveBeenCalledWith(DRIVE_ID, { limit: 200 });
  });

  it("shows the empty state when the trash has no items", async () => {
    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([]));
    renderAt(TRASH_PATH);

    expect(await screen.findByTestId("trash-empty")).toHaveTextContent("Trash is empty");
  });

  it("removes a restored row and names it in a notice that links to its place", async () => {
    vi.mocked(restoreFile).mockResolvedValue({
      ...RECEIPT,
      isFolder: false,
      parentId: FOLDER_ID,
      name: "Old receipt (2).pdf",
      deletedAt: null,
    } as never);
    renderAt(TRASH_PATH);
    await screen.findByRole("button", { name: "Restore Old receipt.pdf" });
    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([HOLIDAY, INSIDE_HOLIDAY]));
    fireEvent.click(screen.getByRole("button", { name: "Restore Old receipt.pdf" }));

    await waitFor(() => expect(screen.queryByText("Old receipt.pdf")).not.toBeInTheDocument());
    expect(screen.getByTestId("trash-restored-notice")).toHaveTextContent(
      '"Old receipt (2).pdf" was restored.',
    );
    expect(screen.getByTestId("trash-restored-link")).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder/${FOLDER_ID}`,
    );
    expect(restoreFile).toHaveBeenCalledWith(RECEIPT.id);
  });

  it("keeps the row and shows an alert when the restore fails", async () => {
    vi.mocked(restoreFile).mockRejectedValue(new ApiError(409, "NOT_TRASHED", "not trashed"));
    renderAt(TRASH_PATH);
    fireEvent.click(await screen.findByRole("button", { name: "Restore Old receipt.pdf" }));

    expect(await screen.findByTestId("trash-restore-error")).toHaveTextContent(
      "This item isn't in the trash.",
    );
    expect(screen.getByText("Old receipt.pdf")).toBeInTheDocument();
  });

  it("shows an error with a retry that reads the trash again", async () => {
    vi.mocked(listDriveTrash).mockRejectedValueOnce(new Error("offline"));
    renderAt(TRASH_PATH);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("button", { name: "Restore Holiday" })).toBeInTheDocument();
  });

  it("lists the items as rows with a Restore icon on a phone", async () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt(TRASH_PATH);

      const list = await screen.findByTestId("trash-list");
      expect(within(list).getByRole("button", { name: "Restore Old receipt.pdf" })).toBeVisible();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows the not found view for a drive id that is not valid", () => {
    renderAt("/files/not-a-drive/trash");

    expect(screen.queryByTestId("trash-page")).not.toBeInTheDocument();
    expect(listDriveTrash).not.toHaveBeenCalled();
  });
});

describe("FilesTrashPage permanent delete", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([HOLIDAY, RECEIPT, INSIDE_HOLIDAY]));
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
    cleanup();
    vi.clearAllMocks();
  });

  it("asks for confirmation before deleting a file for good and does not call the API on cancel", async () => {
    renderAt(TRASH_PATH);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Old receipt.pdf permanently" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Delete permanently?" });
    expect(within(dialog).getByText(/"Old receipt\.pdf"/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("purge-cancel"));

    expect(purgeFile).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Restore Old receipt.pdf" })).toBeInTheDocument();
  });

  it("deletes the file for good on confirm and removes its row", async () => {
    vi.mocked(purgeFile).mockResolvedValue(undefined);
    renderAt(TRASH_PATH);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Old receipt.pdf permanently" }),
    );

    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([HOLIDAY, INSIDE_HOLIDAY]));

    fireEvent.click(screen.getByTestId("purge-confirm"));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Restore Old receipt.pdf" }),
      ).not.toBeInTheDocument(),
    );
    expect(purgeFile).toHaveBeenCalledWith(RECEIPT.id);
  });

  it("moves focus to the next row after a file is deleted for good", async () => {
    vi.mocked(purgeFile).mockResolvedValue(undefined);
    renderAt(TRASH_PATH);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Old receipt.pdf permanently" }),
    );

    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([HOLIDAY, INSIDE_HOLIDAY]));

    fireEvent.click(screen.getByTestId("purge-confirm"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Restore Holiday" })).toHaveFocus(),
    );
  });

  it("keeps the dialog open with the mapped error when the file is no longer in the trash", async () => {
    vi.mocked(purgeFile).mockRejectedValue(new ApiError(409, "NOT_TRASHED", "not in the trash"));
    renderAt(TRASH_PATH);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Old receipt.pdf permanently" }),
    );

    fireEvent.click(screen.getByTestId("purge-confirm"));

    expect(await screen.findByTestId("purge-error")).toHaveTextContent(
      "This item isn't in the trash.",
    );
    expect(screen.getByRole("dialog", { name: "Delete permanently?" })).toBeInTheDocument();
  });

  it("offers Empty trash when the trash has items and empties it on confirm", async () => {
    vi.mocked(emptyDriveTrash).mockResolvedValue(undefined);
    renderAt(TRASH_PATH);
    fireEvent.click(await screen.findByTestId("trash-empty-button"));

    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([]));

    fireEvent.click(screen.getByTestId("empty-trash-confirm"));

    expect(await screen.findByTestId("trash-empty")).toHaveTextContent("Trash is empty");
    expect(emptyDriveTrash).toHaveBeenCalledWith(DRIVE_ID);
    expect(screen.queryByTestId("trash-empty-button")).not.toBeInTheDocument();
  });

  it("keeps everything in the trash when Empty trash is cancelled", async () => {
    renderAt(TRASH_PATH);
    fireEvent.click(await screen.findByTestId("trash-empty-button"));

    fireEvent.click(screen.getByTestId("empty-trash-cancel"));

    expect(emptyDriveTrash).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Restore Old receipt.pdf" })).toBeInTheDocument();
  });

  it("does not offer Empty trash when the trash is empty", async () => {
    vi.mocked(listDriveTrash).mockResolvedValue(PAGE([]));
    renderAt(TRASH_PATH);

    expect(await screen.findByTestId("trash-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("trash-empty-button")).not.toBeInTheDocument();
  });

  it("offers an icon-only delete button on phone rows, named after the item", async () => {
    const restoreWidth = withPhoneWidth(true);
    try {
      renderAt(TRASH_PATH);

      expect(
        await screen.findByRole("button", { name: "Delete Old receipt.pdf permanently" }),
      ).toBeInTheDocument();
    } finally {
      restoreWidth();
    }
  });
});
