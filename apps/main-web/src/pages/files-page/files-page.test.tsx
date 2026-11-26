// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFolder,
  getFile,
  listDriveChildren,
  listDrives,
  listFileChildren,
  uploadFile,
} from "../../files/files-api.js";
import type { Drive } from "../../files/types.js";
import { FilesLayout } from "../../layouts/files-layout/files-layout.js";
import { UploadQueueProvider } from "../../uploads/index.js";
import { FilesPage } from "./files-page.js";

vi.mock("../../files/files-api.js", () => ({
  getFile: vi.fn(),
  listDrives: vi.fn(),
  listDriveChildren: vi.fn(),
  listFileChildren: vi.fn(),
  uploadFile: vi.fn(),
  createFolder: vi.fn(),
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
const ANCESTOR_BREADCRUMBS = [{ kind: "drive", id: DRIVE_ID, name: "Personal" }];
const CHILDREN_PAGE = {
  items: [
    {
      id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
      driveId: DRIVE_ID,
      parentId: FOLDER_ID,
      name: "Summer",
      version: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      isFolder: true,
      itemCount: 0,
    },
  ],
  breadcrumbs: ANCESTOR_BREADCRUMBS,
  nextCursor: null,
};
const PHONE_QUERY = "(max-width: 767px)";

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
      <UploadQueueProvider>
        <Routes>
          <Route path="/files" element={<FilesLayout />}>
            <Route index element={<FilesPage />} />
            <Route path=":driveId/folder/:folderId?" element={<FilesPage />} />
          </Route>
        </Routes>
      </UploadQueueProvider>
    </MemoryRouter>,
  );

describe("FilesPage", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
      this.querySelector<HTMLElement>("input, button, [tabindex]")?.focus();
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
    vi.mocked(getFile).mockResolvedValue({
      file: FOLDER,
      breadcrumbs: ANCESTOR_BREADCRUMBS,
    } as never);
    vi.mocked(listFileChildren).mockResolvedValue(CHILDREN_PAGE as never);
    vi.mocked(listDriveChildren).mockResolvedValue(CHILDREN_PAGE as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the Files heading on the index without loading data", () => {
    renderAt("/files");

    expect(screen.getByTestId("files-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(listDriveChildren).not.toHaveBeenCalled();
    expect(listFileChildren).not.toHaveBeenCalled();
  });

  it("shows the choose-a-drive hint at the index and sends no upload when files are picked", () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt("/files");

      expect(screen.getByText("Choose a drive to upload files.")).toBeInTheDocument();
      fireEvent.change(screen.getByTestId("files-upload-input"), {
        target: { files: [new File(["a"], "a.txt")] },
      });

      expect(uploadFile).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it("shows the drive name as the heading on a wide screen once the folder is loaded", async () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt(FOLDER_PATH);

      expect(await screen.findByRole("heading", { name: "Personal" })).toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("replaces the Files heading with the top row on a phone, also inside a folder", async () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt(FOLDER_PATH);

      await screen.findByTestId("files-breadcrumb-current");
      expect(screen.queryByRole("heading", { name: "Files" })).not.toBeInTheDocument();
      expect(screen.getByTestId("files-top-bar-drive-name")).toHaveTextContent("Personal");
    } finally {
      restore();
    }
  });

  it("hides the Files heading on a phone, where the top row takes its place", () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt("/files");

      expect(screen.queryByRole("heading", { name: "Files" })).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows the top row with the active drive on a phone and not the old drives link", async () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt("/files");

      expect(await screen.findByTestId("files-top-bar-drive-name")).toHaveTextContent("Personal");
      expect(screen.getByTestId("files-top-bar-upload")).toBeDisabled();
      expect(screen.getByTestId("files-top-bar-new-folder")).toBeDisabled();
      expect(screen.queryByTestId("files-drives-link")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows no top row on a wide screen", () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt("/files");

      expect(screen.queryByTestId("files-top-bar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("files-drives-link")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows the loading text while the folder is requested", () => {
    renderAt(FOLDER_PATH);

    expect(screen.getByRole("status", { name: "Loading..." })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Folder path" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("shows the folder path and the entries of the folder once it is loaded", async () => {
    renderAt(FOLDER_PATH);

    await waitFor(() =>
      expect(screen.getByTestId("files-breadcrumb-current")).toHaveTextContent("Photos"),
    );
    expect(screen.getByTestId("files-breadcrumbs")).toHaveTextContent("Personal");
    expect(await screen.findByRole("table", { name: "Folder contents" })).toHaveTextContent(
      "Summer",
    );
    expect(listFileChildren).toHaveBeenCalledWith(FOLDER_ID, { sort: "name", direction: "asc" });
  });

  it("shows the empty text when the folder has no entries", async () => {
    vi.mocked(listFileChildren).mockResolvedValue({
      items: [],
      breadcrumbs: ANCESTOR_BREADCRUMBS,
      nextCursor: null,
    } as never);
    renderAt(FOLDER_PATH);

    expect(await screen.findByTestId("files-empty")).toHaveTextContent("This folder is empty");
  });

  it("shows a back control on a phone inside a folder that goes to the drive root", async () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt(FOLDER_PATH);

      expect(await screen.findByRole("link", { name: "Back to Personal" })).toHaveAttribute(
        "href",
        `/files/${DRIVE_ID}/folder`,
      );
    } finally {
      restore();
    }
  });

  it("shows no back control on a phone at the drive root", async () => {
    const restore = withPhoneWidth(true);
    try {
      renderAt(`/files/${DRIVE_ID}/folder`);

      await waitFor(() => expect(listDriveChildren).toHaveBeenCalled());
      expect(screen.queryByTestId("files-back-link")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows no back control on a wide screen", async () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt(FOLDER_PATH);

      await screen.findByRole("table", { name: "Folder contents" });
      expect(screen.queryByTestId("files-back-link")).not.toBeInTheDocument();
    } finally {
      restore();
    }
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

  it("reloads the folder details when Try again is pressed after they failed", async () => {
    vi.mocked(getFile)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue({ file: FOLDER, breadcrumbs: ANCESTOR_BREADCRUMBS } as never);
    renderAt(FOLDER_PATH);

    fireEvent.click(await screen.findByTestId("files-retry"));

    expect(await screen.findByRole("navigation", { name: "Folder path" })).toBeInTheDocument();
    expect(getFile).toHaveBeenCalledTimes(2);
  });

  it("marks the selected file row and clears the selection when another folder is opened", async () => {
    const restore = withPhoneWidth(false);
    const TRIP_ID = "4b5c6d7e-8f9a-4b0c-8d1e-2f3a4b5c6d7e";
    vi.mocked(listFileChildren).mockResolvedValue({
      items: [
        ...CHILDREN_PAGE.items,
        {
          id: TRIP_ID,
          driveId: DRIVE_ID,
          parentId: FOLDER_ID,
          name: "Trip.pdf",
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          deletedAt: null,
          isFolder: false,
          mimeType: "application/pdf",
          size: 2048,
          currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
        },
      ],
      breadcrumbs: ANCESTOR_BREADCRUMBS,
      nextCursor: null,
    } as never);
    try {
      renderAt(FOLDER_PATH);

      await screen.findByRole("table", { name: "Folder contents" });
      const tripRow = screen
        .getAllByTestId("file-table-row")
        .find((row) => row.textContent?.includes("Trip.pdf"));
      fireEvent.click(within(tripRow as HTMLElement).getByTestId("file-table-activate"));
      expect(tripRow).toHaveAttribute("data-selected", "true");

      const summerRow = screen
        .getAllByTestId("file-table-row")
        .find((row) => row.textContent?.includes("Summer")) as HTMLElement;
      fireEvent.click(within(summerRow).getByTestId("file-table-activate"));
      await waitFor(() =>
        expect(
          screen
            .getAllByTestId("file-table-row")
            .every((row) => row.getAttribute("data-selected") === "false"),
        ).toBe(true),
      );
    } finally {
      restore();
    }
  });

  it("opens the details panel for a selected file and closes it when the selection is cleared", async () => {
    const restore = withPhoneWidth(false);
    const TRIP_ID = "4b5c6d7e-8f9a-4b0c-8d1e-2f3a4b5c6d7e";
    const TRIP_FILE = {
      id: TRIP_ID,
      driveId: DRIVE_ID,
      parentId: FOLDER_ID,
      name: "Trip.pdf",
      version: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      isFolder: false,
      mimeType: "application/pdf",
      size: 2048,
      currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
    };
    vi.mocked(listFileChildren).mockResolvedValue({
      items: [TRIP_FILE],
      breadcrumbs: ANCESTOR_BREADCRUMBS,
      nextCursor: null,
    } as never);
    vi.mocked(getFile).mockImplementation(
      async (fileId: string) =>
        (fileId === TRIP_ID
          ? { file: TRIP_FILE, breadcrumbs: ANCESTOR_BREADCRUMBS }
          : { file: FOLDER, breadcrumbs: ANCESTOR_BREADCRUMBS }) as never,
    );
    try {
      renderAt(FOLDER_PATH);

      await screen.findByRole("table", { name: "Folder contents" });
      const tripRow = screen
        .getAllByTestId("file-table-row")
        .find((row) => row.textContent?.includes("Trip.pdf")) as HTMLElement;
      fireEvent.click(within(tripRow).getByTestId("file-table-activate"));

      expect(await screen.findByTestId("file-details-panel-name")).toHaveTextContent("Trip.pdf");
      expect(screen.getByTestId("file-details-property-location")).toHaveTextContent("Personal");

      fireEvent.click(screen.getByTestId("file-details-panel-close"));

      expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
      expect(tripRow).toHaveAttribute("data-selected", "false");
    } finally {
      restore();
    }
  });

  it("sends the picked files to the open folder", async () => {
    vi.mocked(uploadFile).mockReturnValue(new Promise(() => undefined) as never);
    renderAt(FOLDER_PATH);
    await screen.findByRole("table", { name: "Folder contents" });

    fireEvent.change(screen.getByTestId("files-upload-input"), {
      target: { files: [new File(["x"], "Holiday.txt")] },
    });

    await waitFor(() =>
      expect(uploadFile).toHaveBeenCalledWith(
        DRIVE_ID,
        expect.objectContaining({ parentId: FOLDER_ID }),
      ),
    );
  });

  it("refreshes the open folder quietly once an upload into it finishes", async () => {
    vi.mocked(uploadFile).mockResolvedValue({} as never);
    renderAt(FOLDER_PATH);
    await screen.findByRole("table", { name: "Folder contents" });

    fireEvent.change(screen.getByTestId("files-upload-input"), {
      target: { files: [new File(["x"], "Holiday.txt")] },
    });

    await waitFor(() => expect(listFileChildren).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("table", { name: "Folder contents" })).toBeInTheDocument();
  });

  it("creates a folder in the open folder from the dialog and refreshes the folder quietly", async () => {
    vi.mocked(createFolder).mockResolvedValue({
      id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
    } as never);
    renderAt(FOLDER_PATH);
    await screen.findByRole("table", { name: "Folder contents" });

    fireEvent.click(screen.getByTestId("files-new-folder-button"));
    fireEvent.change(screen.getByTestId("new-folder-name"), { target: { value: "Beach" } });
    fireEvent.click(screen.getByTestId("new-folder-submit"));

    await waitFor(() =>
      expect(createFolder).toHaveBeenCalledWith(DRIVE_ID, { parentId: FOLDER_ID, name: "Beach" }),
    );
    await waitFor(() => expect(listFileChildren).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByTestId("new-folder-dialog")).not.toBeInTheDocument());
  });

  it("creates a folder at the drive root with a null parent", async () => {
    vi.mocked(createFolder).mockResolvedValue({
      id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
    } as never);
    renderAt(`/files/${DRIVE_ID}/folder`);
    await screen.findByRole("table", { name: "Folder contents" });

    fireEvent.click(screen.getByTestId("files-new-folder-button"));
    fireEvent.change(screen.getByTestId("new-folder-name"), { target: { value: "Holiday" } });
    fireEvent.click(screen.getByTestId("new-folder-submit"));

    await waitFor(() =>
      expect(createFolder).toHaveBeenCalledWith(DRIVE_ID, { parentId: null, name: "Holiday" }),
    );
  });
});

describe("FilesPage view and sort controls", () => {
  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([DRIVE]);
    vi.mocked(getFile).mockResolvedValue({
      file: FOLDER,
      breadcrumbs: ANCESTOR_BREADCRUMBS,
    } as never);
    vi.mocked(listFileChildren).mockResolvedValue(CHILDREN_PAGE as never);
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows the view and sort controls on a wide screen", async () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt(FOLDER_PATH);

      expect(await screen.findByTestId("files-view-controls")).toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("shows no view or sort controls on a phone and asks for the default order", async () => {
    const restore = withPhoneWidth(true);
    try {
      window.localStorage.setItem(
        "offgrid.files.viewPreference",
        JSON.stringify({ view: "grid", sort: "size", direction: "desc" }),
      );
      renderAt(FOLDER_PATH);

      await waitFor(() => expect(listFileChildren).toHaveBeenCalled());
      expect(screen.queryByTestId("files-view-controls")).not.toBeInTheDocument();
      expect(listFileChildren).toHaveBeenCalledWith(FOLDER_ID, { sort: "name", direction: "asc" });
    } finally {
      restore();
    }
  });

  it("asks the API for the chosen sort order and remembers it", async () => {
    const restore = withPhoneWidth(false);
    try {
      renderAt(FOLDER_PATH);
      const select = await screen.findByTestId("files-sort-select");

      fireEvent.change(select, { target: { value: "size" } });

      await waitFor(() =>
        expect(listFileChildren).toHaveBeenLastCalledWith(FOLDER_ID, {
          sort: "size",
          direction: "asc",
        }),
      );
      expect(window.localStorage.getItem("offgrid.files.viewPreference")).toContain('"size"');
    } finally {
      restore();
    }
  });
});
