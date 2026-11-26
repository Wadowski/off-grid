// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as filesApi from "../../files-api.js";
import type { Drive, FileEntry, FileListItem, FileListPage, MoveSource } from "../../types.js";
import { MoveDialog } from "./move-dialog.js";
import type { MoveDialogProps } from "./types.js";
import * as fetchPage from "../../fetch-folder-page.js";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

const driveId = (value: string) => value as Drive["id"];
const fileId = (value: string) => value as FileEntry["id"];
const PERSONAL = { id: driveId("p"), familyId: null, name: "Personal" } as Drive;
const HOME = { id: driveId("h"), familyId: "f1", name: "Home" } as Drive;
const SOURCE: MoveSource = {
  entryId: fileId("entry"),
  entryName: "Insurance policy.txt",
  driveId: driveId("p"),
  parentId: null,
};
const DOCUMENTS = { id: fileId("docs"), name: "Documents", isFolder: true } as FileListItem;
const page = (items: FileListItem[]): FileListPage =>
  ({ items, breadcrumbs: [], nextCursor: null }) as FileListPage;

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  vi.spyOn(fetchPage, "fetchFolderPage").mockResolvedValue(page([DOCUMENTS]));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

const clickRow = (testId: string) => {
  const row = screen.getByTestId(testId).firstElementChild;
  if (!(row instanceof HTMLElement)) {
    throw new Error(`expected a row in ${testId}`);
  }
  fireEvent.click(row);
};

const renderProps = (overrides: Partial<MoveDialogProps> = {}): MoveDialogProps => ({
  drives: [PERSONAL, HOME],
  source: SOURCE,
  narrow: false,
  returnFocusTo: null,
  onClose: vi.fn(),
  onMoved: vi.fn(),
  ...overrides,
});

const renderDialog = (overrides: Partial<MoveDialogProps> = {}) => {
  const props = renderProps(overrides);
  render(<MoveDialog {...props} />);
  return props;
};

describe("MoveDialog", () => {
  it("is named after the entry and lists the drives as roots", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: 'Move "Insurance policy.txt"' })).toBeInTheDocument();
    expect(screen.getByTestId("move-dialog-node-p")).toHaveAttribute("aria-level", "1");
    expect(screen.getByTestId("move-dialog-node-h")).toBeInTheDocument();
  });

  it("keeps Move disabled until a different target is chosen", () => {
    renderDialog();

    clickRow("move-dialog-node-p");

    expect(screen.getByTestId("move-dialog-confirm")).toBeDisabled();
  });

  it("loads a folder on expand and moves the entry into it", async () => {
    const move = vi.spyOn(filesApi, "moveFile").mockResolvedValue({
      file: { id: SOURCE.entryId } as FileEntry,
      crossOwnerNotice: true,
    });
    const props = renderDialog();

    clickRow("move-dialog-node-h");
    fireEvent.keyDown(screen.getByTestId("move-dialog-node-h"), { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByTestId("move-dialog-node-docs")).toBeInTheDocument());
    clickRow("move-dialog-node-docs");
    fireEvent.click(screen.getByTestId("move-dialog-confirm"));
    fireEvent.click(screen.getByTestId("move-dialog-confirm"));
    await waitFor(() => expect(props.onMoved).toHaveBeenCalledTimes(1));

    expect(move).toHaveBeenCalledWith(SOURCE.entryId, {
      driveId: driveId("h"),
      parentId: fileId("docs"),
    });
    expect(props.onMoved).toHaveBeenCalledWith({
      entryName: "Insurance policy.txt",
      targetName: "Documents",
      crossOwnerNotice: true,
    });
  });

  it("asks for a second press before copying to another owner", async () => {
    const move = vi.spyOn(filesApi, "moveFile").mockResolvedValue({
      file: { id: SOURCE.entryId } as FileEntry,
      crossOwnerNotice: true,
    });
    const props = renderDialog();

    clickRow("move-dialog-node-h");
    fireEvent.click(screen.getByTestId("move-dialog-confirm"));

    expect(screen.getByTestId("move-dialog-cross-owner-confirm")).toHaveTextContent(
      "This copies it to the other drive and removes the original.",
    );
    expect(move).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("move-dialog-confirm"));
    await waitFor(() => expect(props.onMoved).toHaveBeenCalledTimes(1));
    expect(move).toHaveBeenCalledTimes(1);
  });

  it("shows the server refusal and keeps the dialog open", async () => {
    vi.spyOn(filesApi, "moveFile").mockRejectedValue(new ApiError(400, "INVALID_MOVE", "invalid"));
    const props = renderDialog();

    clickRow("move-dialog-node-h");
    fireEvent.click(screen.getByTestId("move-dialog-confirm"));
    fireEvent.click(screen.getByTestId("move-dialog-confirm"));

    await waitFor(() =>
      expect(screen.getByTestId("move-dialog-error")).toHaveTextContent(
        "This item can't be moved there.",
      ),
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(props.onMoved).not.toHaveBeenCalled();
  });

  it("returns focus to the element it was given when it closes", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const { unmount } = render(<MoveDialog {...renderProps({ returnFocusTo: trigger })} />);

    unmount();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
