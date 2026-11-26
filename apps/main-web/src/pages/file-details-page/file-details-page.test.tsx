// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { driveIdSchema, fileIdSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listFamilyMembers } from "../../families/list-family-members.js";
import { getFile, listDrives, listFileVersions } from "../../files/files-api.js";
import { UploadQueueProvider } from "../../uploads/index.js";
import { FileDetailsPage } from "./file-details-page.js";

vi.mock("../../files/files-api.js", () => ({
  getFile: vi.fn(),
  listDrives: vi.fn(),
  listFileVersions: vi.fn(),
}));

vi.mock("../../families/list-family-members.js", () => ({
  listFamilyMembers: vi.fn(),
}));

vi.mock("../../session/use-session.js", () => ({
  useSession: () => ({
    status: "signedIn",
    user: {
      id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
      email: "anna@example.test",
      displayName: "Anna",
      instanceRole: "user",
    },
    families: [],
    activeFamilyId: null,
  }),
}));

const DRIVE_ID = driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");
const PHOTOS_ID = fileIdSchema.parse("7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a");
const FILE_ID = fileIdSchema.parse("9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e");
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const ANNA_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const BEN_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";
const OTHER_DRIVE_ID = "1f2e3d4c-5b6a-4978-8a7b-6c5d4e3f2a1b";
const FAMILY_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";
const FILE_PATH = `/files/${DRIVE_ID}/file/${FILE_ID}`;

const timestamps = {
  createdAt: "2026-03-01T08:00:00.000Z",
  updatedAt: "2026-03-04T05:06:07.000Z",
  deletedAt: null,
};

const regularFile = (overrides: Record<string, unknown> = {}) => ({
  file: {
    id: FILE_ID,
    driveId: DRIVE_ID,
    parentId: PHOTOS_ID,
    name: "Beach.jpg",
    version: 2,
    isFolder: false,
    mimeType: "image/jpeg",
    size: 2048,
    currentVersionId: VERSION_ID,
    ...timestamps,
    ...overrides,
  },
  breadcrumbs: [
    { kind: "drive", id: DRIVE_ID, name: "Personal" },
    { kind: "folder", id: PHOTOS_ID, name: "Photos" },
  ],
});

const folderDetails = () => ({
  file: {
    id: PHOTOS_ID,
    driveId: DRIVE_ID,
    parentId: null,
    name: "Photos",
    version: 1,
    isFolder: true,
    ...timestamps,
  },
  breadcrumbs: [
    { kind: "drive", id: DRIVE_ID, name: "Personal" },
    { kind: "folder", id: PHOTOS_ID, name: "Photos" },
  ],
});

const PERSONAL_DRIVE = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const FAMILY_DRIVE = { ...PERSONAL_DRIVE, familyId: FAMILY_ID, name: "Kowalski" };

const BEN_MEMBER = {
  userId: BEN_ID,
  displayName: "Ben",
  role: "member",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

const VERSIONS = [
  {
    id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c10",
    fileId: FILE_ID,
    number: 1,
    size: 100,
    mimeType: "image/jpeg",
    createdByUserId: ANNA_ID,
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: VERSION_ID,
    fileId: FILE_ID,
    number: 2,
    size: 2048,
    mimeType: "image/jpeg",
    createdByUserId: BEN_ID,
    createdAt: "2026-03-04T05:06:07.000Z",
  },
];

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <UploadQueueProvider>
        <Routes>
          <Route path="/files/:driveId/file/:fileId" element={<FileDetailsPage />} />
          <Route path="/files/:driveId/folder/:folderId" element={<p>Folder page</p>} />
          <Route path="/files" element={<p>Files home</p>} />
        </Routes>
      </UploadQueueProvider>
    </MemoryRouter>,
  );

describe("FileDetailsPage", () => {
  beforeEach(() => {
    vi.mocked(getFile).mockReset();
    vi.mocked(listDrives)
      .mockReset()
      .mockResolvedValue([PERSONAL_DRIVE] as never);
    vi.mocked(listFileVersions)
      .mockReset()
      .mockResolvedValue(VERSIONS as never);
    vi.mocked(listFamilyMembers)
      .mockReset()
      .mockResolvedValue([] as never);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the loading text, then the file details", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    renderAt(FILE_PATH);

    expect(screen.getByTestId("file-details-loading")).toBeInTheDocument();
    expect(await screen.findByTestId("file-details-ready")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-name")).toHaveTextContent("Beach.jpg");
    expect(screen.getByRole("link", { name: "Back to Photos" })).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder/${PHOTOS_ID}`,
    );
  });

  it("shows who saved the current version next to the modified date", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    vi.mocked(listDrives).mockResolvedValue([FAMILY_DRIVE] as never);
    vi.mocked(listFamilyMembers).mockResolvedValue([BEN_MEMBER] as never);
    renderAt(FILE_PATH);

    await screen.findByTestId("file-details-ready");
    await waitFor(() =>
      expect(screen.getByTestId("file-details-property-modified")).toHaveTextContent("by Ben"),
    );
  });

  it("lists the owner under Who has access for a personal drive", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    renderAt(FILE_PATH);

    const rows = await screen.findAllByTestId("file-access-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Anna");
    expect(rows[0]).toHaveTextContent("Owner");
    expect(rows[0]).toHaveTextContent("Can edit");
  });

  it("shows the activity of the file, newest first, on the Activity tab", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    vi.mocked(listDrives).mockResolvedValue([FAMILY_DRIVE] as never);
    vi.mocked(listFamilyMembers).mockResolvedValue([BEN_MEMBER] as never);
    renderAt(FILE_PATH);

    await screen.findByTestId("file-details-ready");
    await waitFor(() =>
      expect(screen.getByTestId("file-details-activity-count")).toHaveTextContent("2"),
    );
    fireEvent.click(screen.getByTestId("segmented-option-activity"));

    const rows = await screen.findAllByTestId("file-activity-row");
    expect(rows[0]).toHaveTextContent("Ben saved version 2");
    expect(rows[1]).toHaveTextContent("Anna added the file");
  });

  it("keeps the properties when the versions cannot be loaded", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile() as never);
    vi.mocked(listFileVersions).mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-details-property-size")).toBeInTheDocument();
    fireEvent.click(await screen.findByTestId("segmented-option-activity"));
    expect(await screen.findByText("Activity could not be loaded.")).toBeInTheDocument();
  });

  it("shows the mapped error and retries the request", async () => {
    vi.mocked(getFile)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(regularFile() as never);
    renderAt(FILE_PATH);

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByTestId("file-details-ready")).toBeInTheDocument();
  });

  it("shows File not found when the API reports the file as missing", async () => {
    vi.mocked(getFile).mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found when the file is in another drive", async () => {
    vi.mocked(getFile).mockResolvedValue(regularFile({ driveId: OTHER_DRIVE_ID }) as never);
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found for a trashed file", async () => {
    vi.mocked(getFile).mockResolvedValue(
      regularFile({ deletedAt: "2026-03-05T00:00:00.000Z" }) as never,
    );
    renderAt(FILE_PATH);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
  });

  it("shows File not found for an id that is not valid", async () => {
    renderAt(`/files/${DRIVE_ID}/file/not-an-id`);

    expect(await screen.findByTestId("file-not-found")).toBeInTheDocument();
    expect(getFile).not.toHaveBeenCalled();
  });

  it("redirects a folder id to the folder page", async () => {
    vi.mocked(getFile).mockResolvedValue(folderDetails() as never);
    renderAt(`/files/${DRIVE_ID}/file/${PHOTOS_ID}`);

    expect(await screen.findByText("Folder page")).toBeInTheDocument();
  });

  it("links a file at the drive root back to the drive root", async () => {
    vi.mocked(getFile).mockResolvedValue({
      ...regularFile(),
      breadcrumbs: [{ kind: "drive", id: DRIVE_ID, name: "Personal" }],
    } as never);
    renderAt(FILE_PATH);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Back to Personal" })).toHaveAttribute(
        "href",
        `/files/${DRIVE_ID}/folder`,
      ),
    );
  });
});
