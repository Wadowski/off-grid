// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { renameEntry } from "../../../../files/rename-entry.js";
import type { FileEntry, FileListItem } from "../../../../files/types.js";
import { RenameEntryDialog } from "./rename-entry-dialog.js";

vi.mock("../../../../files/rename-entry.js", () => ({ renameEntry: vi.fn() }));

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const FILE = { id: FILE_ID, name: "Insurance policy.txt", isFolder: false } as FileListItem;
const FOLDER = { id: FILE_ID, name: "Photos", isFolder: true, itemCount: 0 } as FileListItem;
const RENAMED = { id: FILE_ID, name: "Insurance 2026.txt" } as FileEntry;

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
    this.querySelector<HTMLElement>("input, button, [tabindex]")?.focus();
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const renderDialog = (entry: FileListItem = FILE) => {
  const onRenamed = vi.fn();
  const onClose = vi.fn();
  render(<RenameEntryDialog entry={entry} onRenamed={onRenamed} onClose={onClose} />);
  return { onRenamed, onClose };
};

const typeName = (value: string) =>
  fireEvent.change(screen.getByTestId("rename-entry-name"), { target: { value } });

describe("RenameEntryDialog", () => {
  it("opens for a file with the full name, the base name selected and the field focused", () => {
    renderDialog();

    const field = screen.getByTestId("rename-entry-name") as HTMLInputElement;
    expect(screen.getByTestId("rename-entry-dialog")).toHaveAccessibleName("Rename file");
    expect(field).toHaveValue("Insurance policy.txt");
    expect(field).toHaveFocus();
    expect([field.selectionStart, field.selectionEnd]).toEqual([0, 16]);
  });

  it("names a folder heading and selects its whole name", () => {
    renderDialog(FOLDER);

    const field = screen.getByTestId("rename-entry-name") as HTMLInputElement;
    expect(screen.getByTestId("rename-entry-dialog")).toHaveAccessibleName("Rename folder");
    expect([field.selectionStart, field.selectionEnd]).toEqual([0, 6]);
  });

  it("renames the entry, reports it and closes", async () => {
    vi.mocked(renameEntry).mockResolvedValue(RENAMED);
    const { onRenamed } = renderDialog();
    typeName("Insurance 2026.txt");

    fireEvent.click(screen.getByTestId("rename-entry-submit"));

    await waitFor(() => expect(onRenamed).toHaveBeenCalledWith(RENAMED));
    expect(renameEntry).toHaveBeenCalledWith(FILE_ID, "Insurance 2026.txt");
    await waitFor(() =>
      expect(screen.getByTestId("rename-entry-dialog")).not.toHaveAttribute("open"),
    );
  });

  it("closes without a request when the name is unchanged", async () => {
    const { onRenamed, onClose } = renderDialog();

    fireEvent.click(screen.getByTestId("rename-entry-submit"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(renameEntry).not.toHaveBeenCalled();
    expect(onRenamed).not.toHaveBeenCalled();
  });

  it("keeps the dialog open with the name-taken message and the typed name", async () => {
    vi.mocked(renameEntry).mockRejectedValue(new ApiError(409, "NAME_TAKEN", "taken"));
    const { onRenamed } = renderDialog();
    typeName("Zulu.txt");

    fireEvent.click(screen.getByTestId("rename-entry-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A file or folder with this name already exists here.",
    );
    expect(screen.getByTestId("rename-entry-name")).toHaveValue("Zulu.txt");
    expect(screen.getByTestId("rename-entry-dialog")).toHaveAttribute("open");
    expect(onRenamed).not.toHaveBeenCalled();
  });

  it("refuses an empty name in the dialog without a request", () => {
    renderDialog();
    typeName("   ");

    fireEvent.click(screen.getByTestId("rename-entry-submit"));

    expect(screen.getByText("Enter a name.")).toBeInTheDocument();
    expect(renameEntry).not.toHaveBeenCalled();
  });

  it("disables submit and marks the form busy while the request runs", async () => {
    vi.mocked(renameEntry).mockReturnValue(new Promise(() => undefined));
    renderDialog();
    typeName("Insurance 2026.txt");

    fireEvent.click(screen.getByTestId("rename-entry-submit"));

    await waitFor(() => expect(screen.getByTestId("rename-entry-submit")).toBeDisabled());
    expect(screen.getByTestId("rename-entry-submit")).toHaveAttribute("aria-busy", "true");
  });

  it("reports the close from the Cancel button without a request", () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByTestId("rename-entry-cancel"));

    expect(onClose).toHaveBeenCalled();
    expect(renameEntry).not.toHaveBeenCalled();
  });
});
