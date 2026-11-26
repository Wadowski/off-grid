// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import { UploadQueueProvider } from "../../uploads/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NARROW_MEDIA_QUERY } from "../../constants.js";
import { getFile, listDrives } from "../../files/files-api.js";
import type { FileListItem } from "../../files/types.js";
import { FilesLayout } from "./files-layout.js";
import type { FilesOutletContext } from "./types.js";

vi.mock("../../files/files-api.js", () => ({
  listDrives: vi.fn(),
  getFile: vi.fn(),
  listFileVersions: vi.fn(async () => []),
}));

const PERSONAL = driveSchema.parse({
  id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
});
const FAMILY = driveSchema.parse({
  id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  familyId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "The Smiths",
  createdAt: "2026-01-02T00:00:00.000Z",
});

const withNarrowScreen = (isNarrow: boolean) => {
  const original = window.matchMedia;
  window.matchMedia = (query: string) => ({
    ...original(query),
    matches: isNarrow && query === NARROW_MEDIA_QUERY,
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
          <Route path="files" element={<FilesLayout />}>
            <Route index element={<p>Files index content</p>} />
            <Route path=":driveId/*" element={<p>Drive content</p>} />
          </Route>
        </Routes>
      </UploadQueueProvider>
    </MemoryRouter>,
  );

const FOLDER_PATH = `/files/${PERSONAL.id}/folder/9e0f1a2b-3c4d-4e5f-8a6b-7c8d9e0f1a2b`;
const FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileListItem["id"];
const FILE = {
  id: FILE_ID,
  driveId: PERSONAL.id,
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
};

const SelectionRow = () => {
  const { selectedFileId, onSelectFile } = useOutletContext<FilesOutletContext>();
  return (
    <button
      type="button"
      data-testid="selection-row"
      aria-current={selectedFileId === FILE_ID ? "true" : undefined}
      onClick={() => onSelectFile(FILE_ID)}
    >
      Trip.pdf
    </button>
  );
};

const renderSelectable = () =>
  render(
    <MemoryRouter initialEntries={[FOLDER_PATH]}>
      <UploadQueueProvider>
        <Routes>
          <Route path="files" element={<FilesLayout />}>
            <Route path=":driveId/folder/:folderId" element={<SelectionRow />} />
          </Route>
        </Routes>
      </UploadQueueProvider>
    </MemoryRouter>,
  );

describe("FilesLayout", () => {
  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([PERSONAL, FAMILY]);
    vi.mocked(getFile).mockResolvedValue({
      file: FILE,
      breadcrumbs: [{ kind: "drive", id: PERSONAL.id, name: "Personal" }],
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the Files index content inside the layout", async () => {
    renderAt("/files");

    expect(screen.getByTestId("files-layout")).toContainElement(
      screen.getByText("Files index content"),
    );
    expect(await screen.findAllByTestId("drive-switcher-row")).toHaveLength(2);
  });

  it("renders a drive route inside the layout", async () => {
    renderAt("/files/drive-1/folder-2");

    expect(screen.getByTestId("files-layout")).toContainElement(screen.getByText("Drive content"));
    expect(screen.queryByText("Files index content")).not.toBeInTheDocument();
    expect(await screen.findAllByTestId("drive-switcher-row")).toHaveLength(2);
  });

  it("shows the drive switcher beside the page on a wide screen", async () => {
    renderAt("/files");

    const sidebar = await screen.findByTestId("drive-switcher");
    expect(within(sidebar).getByRole("link", { name: "Personal" })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: "The Smiths" })).toBeInTheDocument();
    expect(screen.getByTestId("files-layout")).toContainElement(sidebar);
  });

  it("marks the personal drive as active on the Files index", async () => {
    renderAt("/files");

    expect(await screen.findByRole("link", { name: "Personal" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "The Smiths" })).not.toHaveAttribute("aria-current");
  });

  it("marks the drive in the route as active", async () => {
    renderAt(`/files/${FAMILY.id}/folder`);

    expect(await screen.findByRole("link", { name: "The Smiths" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Personal" })).not.toHaveAttribute("aria-current");
  });

  it("hides the drive switcher on a narrow screen", async () => {
    const restore = withNarrowScreen(true);
    try {
      renderAt("/files");

      expect(screen.getByText("Files index content")).toBeInTheDocument();
      expect(screen.queryByTestId("drive-switcher")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("puts the details panel in the aside in place of the drive switcher while a file is selected", async () => {
    renderSelectable();

    fireEvent.click(screen.getByTestId("selection-row"));

    expect(await screen.findByTestId("file-details-panel")).toBeInTheDocument();
    expect(screen.getByTestId("files-layout")).toContainElement(
      screen.getByTestId("file-details-panel"),
    );
    expect(screen.queryByTestId("drive-switcher")).not.toBeInTheDocument();
  });

  it("gives the drive switcher back when the details panel is closed", async () => {
    renderSelectable();
    fireEvent.click(screen.getByTestId("selection-row"));
    await screen.findByTestId("file-details-panel");

    fireEvent.click(screen.getByTestId("file-details-panel-close"));

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
    expect(await screen.findByTestId("drive-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("selection-row")).not.toHaveAttribute("aria-current");
  });

  it("closes the panel on Escape and returns focus to the selected row", async () => {
    renderSelectable();
    fireEvent.click(screen.getByTestId("selection-row"));
    await screen.findByTestId("file-details-panel-name");

    fireEvent.keyDown(screen.getByTestId("file-details-panel"), { key: "Escape" });

    expect(screen.queryByTestId("file-details-panel")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("selection-row")).toHaveFocus());
  });
});
