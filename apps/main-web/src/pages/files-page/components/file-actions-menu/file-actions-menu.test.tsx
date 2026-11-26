// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FileListItem } from "../../../../files/types.js";
import { FileActionsMenu } from "./file-actions-menu.js";

const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const PHOTOS = {
  id: PHOTOS_ID,
  name: "Photos",
  isFolder: true,
  itemCount: 0,
  updatedAt: "2026-01-01T00:00:00.000Z",
} as FileListItem;

afterEach(() => {
  vi.restoreAllMocks();
});

const renderActions = (onOpen = vi.fn(), onDelete = vi.fn(), onMove = vi.fn()) => {
  render(<FileActionsMenu entry={PHOTOS} onOpen={onOpen} onDelete={onDelete} onMove={onMove} />);
  return { onOpen, onDelete, onMove };
};

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "Actions for Photos" }));

describe("FileActionsMenu", () => {
  it("lists Open, Move and Delete for the entry", () => {
    renderActions();

    openMenu();

    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Move" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();
  });

  it("asks for the move of the entry when Move is chosen", () => {
    const { onMove } = renderActions();
    fireEvent.click(screen.getByRole("button", { name: /Actions for/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Move" }));

    expect(onMove).toHaveBeenCalledOnce();
  });

  it("opens the entry when Open is chosen", () => {
    const { onOpen } = renderActions();
    openMenu();

    fireEvent.click(screen.getByTestId("file-action-open"));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("hands the delete request for the entry and its trigger to the parent", () => {
    const { onDelete } = renderActions();
    openMenu();

    fireEvent.click(screen.getByTestId("file-action-delete"));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(
      PHOTOS,
      screen.getByRole("button", { name: "Actions for Photos" }),
    );
  });

  it("does not open a confirmation itself", () => {
    renderActions();
    openMenu();

    fireEvent.click(screen.getByTestId("file-action-delete"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
