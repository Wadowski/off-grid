// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NARROW_MEDIA_QUERY } from "../../constants.js";
import { listDrives } from "../../files/files-api.js";
import { FilesLayout } from "./files-layout.js";

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
          <Route path=":driveId/*" element={<p>Drive content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FilesLayout", () => {
  beforeEach(() => {
    vi.mocked(listDrives).mockResolvedValue([PERSONAL, FAMILY]);
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
});
