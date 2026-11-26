// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FileListItem } from "../../../../../../files/types.js";
import { FileGridGroup } from "./file-grid-group.js";
import type { FileGridGroupProps } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const UPDATED_AT = "2026-01-01T00:00:00.000Z";

const PHOTOS: FileListItem = fileListItemSchema.parse({
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
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

const ARCHIVE: FileListItem = fileListItemSchema.parse({
  id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Archive",
  version: 1,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  deletedAt: null,
  isFolder: true,
  itemCount: 0,
});

const renderGroup = (overrides: Partial<FileGridGroupProps> = {}) => {
  const props: FileGridGroupProps = {
    labelTextId: "files.grid.folders",
    testId: "files-file-grid-folders",
    items: [PHOTOS, ARCHIVE],
    selectedId: null,
    onActivate: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    ...overrides,
  };
  render(<FileGridGroup {...props} />);
  return props;
};

describe("FileGridGroup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders one named list with a card for each item in the order given", () => {
    renderGroup();

    const list = screen.getByRole("list", { name: "Folders" });
    expect(list).toHaveAttribute("data-testid", "files-file-grid-folders");
    expect(
      within(list)
        .getAllByTestId("file-name")
        .map((node) => node.textContent),
    ).toEqual(["Photos", "Archive"]);
  });

  it("reports the item whose card is activated", () => {
    const props = renderGroup();

    fireEvent.click(screen.getAllByTestId("file-card-activate")[1] as HTMLElement);

    expect(props.onActivate).toHaveBeenCalledWith(ARCHIVE);
  });

  it("marks the card of the selected item", () => {
    renderGroup({ selectedId: ARCHIVE.id });

    expect(screen.getAllByTestId("file-card")[1]).toHaveAttribute("data-selected", "true");
    expect(screen.getAllByTestId("file-card")[0]).toHaveAttribute("data-selected", "false");
  });
});
