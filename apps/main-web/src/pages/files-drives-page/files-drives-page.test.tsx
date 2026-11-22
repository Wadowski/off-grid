// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NARROW_MEDIA_QUERY } from "../../constants.js";
import { listDrives } from "../../files/files-api.js";
import { FilesLayout } from "../../layouts/files-layout/files-layout.js";
import { FilesDrivesPage } from "./files-drives-page.js";

vi.mock("../../files/files-api.js", () => ({
  listDrives: vi.fn(),
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
      <Routes>
        <Route path="files" element={<FilesLayout />}>
          <Route index element={<p>Files index content</p>} />
          <Route path="drives" element={<FilesDrivesPage />} />
          <Route path=":driveId/*" element={<p>Drive content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FilesDrivesPage", () => {
  let restoreScreen: () => void = () => undefined;

  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([PERSONAL, FAMILY]);
  });

  afterEach(() => {
    restoreScreen();
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the personal drive and the family drives on a phone", async () => {
    restoreScreen = withNarrowScreen(true);
    renderAt("/files/drives");

    const page = await screen.findByTestId("files-drives-page");
    const rows = within(page).getAllByTestId("drive-switcher-row");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Personal"),
      expect.stringContaining("The Smiths"),
    ]);
  });

  it("links back to the Files page", async () => {
    restoreScreen = withNarrowScreen(true);
    renderAt("/files/drives");

    expect(await screen.findByTestId("files-drives-back-link")).toHaveAttribute("href", "/files");
  });

  it("marks the personal drive as the current page when opened from the drives page", async () => {
    restoreScreen = withNarrowScreen(true);
    renderAt("/files/drives");

    await screen.findByTestId("files-drives-page");
    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("sends a desktop visit back to the Files page", async () => {
    restoreScreen = withNarrowScreen(false);
    renderAt("/files/drives");

    expect(await screen.findByText("Files index content")).toBeInTheDocument();
    expect(screen.queryByTestId("files-drives-page")).not.toBeInTheDocument();
  });
});
