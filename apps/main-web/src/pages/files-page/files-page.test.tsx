// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFile, listDriveChildren, listDrives, listFileChildren } from "../../files/files-api.js";
import type { Drive } from "../../files/types.js";
import type { DriveSwitcherProps } from "../../layouts/files-layout/components/drive-switcher/types.js";
import { FilesPage } from "./files-page.js";

vi.mock("../../files/files-api.js", () => ({
  getFile: vi.fn(),
  listDrives: vi.fn(),
  listDriveChildren: vi.fn(),
  listFileChildren: vi.fn(),
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

const SWITCHER: DriveSwitcherProps = {
  drives: [DRIVE],
  status: "ready",
  errorTextId: null,
  activeDriveId: DRIVE.id,
  onRetry: () => undefined,
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={SWITCHER} />}>
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/:driveId/folder/:folderId?" element={<FilesPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FilesPage", () => {
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
    expect(listDrives).not.toHaveBeenCalled();
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

    expect(screen.getByText("Loading...")).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Personal" })).toBeInTheDocument();
    expect(await screen.findByRole("list", { name: "Folder contents" })).toHaveTextContent(
      "Summer",
    );
    expect(listFileChildren).toHaveBeenCalledWith(FOLDER_ID, {});
  });

  it("shows the empty text when the folder has no entries", async () => {
    vi.mocked(listFileChildren).mockResolvedValue({
      items: [],
      breadcrumbs: ANCESTOR_BREADCRUMBS,
      nextCursor: null,
    } as never);
    renderAt(FOLDER_PATH);

    expect(await screen.findByTestId("files-empty")).toHaveTextContent("This folder is empty.");
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

      await screen.findByRole("list", { name: "Folder contents" });
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
});
