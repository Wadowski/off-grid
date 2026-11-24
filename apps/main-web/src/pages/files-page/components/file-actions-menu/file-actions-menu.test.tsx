// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../../../../api/web-api-client.js";
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
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
  vi.restoreAllMocks();
});

const renderActions = (onOpen = vi.fn(), onTrashed = vi.fn()) => {
  render(<FileActionsMenu entry={PHOTOS} onOpen={onOpen} onTrashed={onTrashed} />);
  return { onOpen, onTrashed };
};

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "Actions for Photos" }));

const chooseDelete = () => {
  openMenu();
  fireEvent.click(screen.getByTestId("file-action-delete"));
};

describe("FileActionsMenu", () => {
  it("lists Open and Delete for the entry", () => {
    renderActions();

    openMenu();

    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();
  });

  it("opens the entry when Open is chosen", () => {
    const { onOpen } = renderActions();
    openMenu();

    fireEvent.click(screen.getByTestId("file-action-open"));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("asks before moving the entry to the trash and makes no call when cancelled", () => {
    const trash = vi.spyOn(webFilesClient, "trashFile");
    const { onTrashed } = renderActions();

    chooseDelete();
    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toHaveTextContent("Photos");
    fireEvent.click(screen.getByTestId("delete-entry-cancel"));

    expect(trash).not.toHaveBeenCalled();
    expect(onTrashed).not.toHaveBeenCalled();
    expect(screen.queryByTestId("delete-entry-dialog")).not.toBeInTheDocument();
  });

  it("moves the entry to the trash when confirmed and reports it", async () => {
    const trash = vi
      .spyOn(webFilesClient, "trashFile")
      .mockResolvedValue({} as Awaited<ReturnType<typeof webFilesClient.trashFile>>);
    const { onTrashed } = renderActions();

    chooseDelete();
    fireEvent.click(screen.getByTestId("delete-entry-confirm"));

    await waitFor(() => expect(onTrashed).toHaveBeenCalledWith(PHOTOS));
    expect(trash).toHaveBeenCalledWith(PHOTOS_ID);
  });

  it("keeps the confirmation open with the error when the move fails", async () => {
    vi.spyOn(webFilesClient, "trashFile").mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "missing"),
    );
    const { onTrashed } = renderActions();

    chooseDelete();
    fireEvent.click(screen.getByTestId("delete-entry-confirm"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toBeInTheDocument();
    expect(screen.getByTestId("delete-entry-confirm")).toBeEnabled();
    expect(onTrashed).not.toHaveBeenCalled();
  });

  it("ignores cancel while the move is running", () => {
    const trash = vi
      .spyOn(webFilesClient, "trashFile")
      .mockReturnValue(new Promise(() => undefined));
    const { onTrashed } = renderActions();
    chooseDelete();
    fireEvent.click(screen.getByTestId("delete-entry-confirm"));

    fireEvent.click(screen.getByTestId("delete-entry-cancel"));
    fireEvent(
      screen.getByRole("dialog", { name: "Move to trash?" }),
      new Event("cancel", { cancelable: true }),
    );

    expect(trash).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toBeInTheDocument();
    expect(screen.getByTestId("delete-entry-confirm")).toBeDisabled();
    expect(onTrashed).not.toHaveBeenCalled();
  });

  it("shows no stale error when the confirmation is reopened after a failed move", async () => {
    vi.spyOn(webFilesClient, "trashFile").mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "missing"),
    );
    renderActions();
    chooseDelete();
    fireEvent.click(screen.getByTestId("delete-entry-confirm"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("delete-entry-cancel"));
    expect(screen.queryByTestId("delete-entry-dialog")).not.toBeInTheDocument();
    chooseDelete();

    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
