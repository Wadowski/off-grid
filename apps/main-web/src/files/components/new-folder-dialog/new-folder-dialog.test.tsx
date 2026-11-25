// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createFolder } from "../../create-folder.js";
import type { Drive, FileEntry } from "../../types.js";
import { NewFolderDialog } from "./new-folder-dialog.js";

vi.mock("../../create-folder.js", () => ({ createFolder: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const ENTRY = { id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a", name: "Holiday" } as FileEntry;

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

const renderDialog = () => {
  const onCreated = vi.fn();
  const onClose = vi.fn();
  render(
    <NewFolderDialog driveId={DRIVE_ID} parentId={null} onCreated={onCreated} onClose={onClose} />,
  );
  return { onCreated, onClose };
};

describe("NewFolderDialog", () => {
  it("opens with the heading and the name field focused", () => {
    renderDialog();

    expect(screen.getByTestId("new-folder-dialog")).toHaveAccessibleName("New folder");
    expect(screen.getByTestId("new-folder-name")).toHaveFocus();
  });

  it("reports the close when the dialog is dismissed", () => {
    const { onClose } = renderDialog();

    fireEvent(screen.getByTestId("new-folder-dialog"), new Event("close"));

    expect(onClose).toHaveBeenCalled();
  });

  it("creates the folder, reports it and closes when the name is valid", async () => {
    vi.mocked(createFolder).mockResolvedValue(ENTRY);
    const { onCreated } = renderDialog();
    fireEvent.change(screen.getByTestId("new-folder-name"), { target: { value: "Holiday" } });

    fireEvent.click(screen.getByTestId("new-folder-submit"));

    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(createFolder).toHaveBeenCalledWith(DRIVE_ID, null, "Holiday");
    expect(screen.getByTestId("new-folder-dialog")).not.toHaveAttribute("open");
  });

  it("stays open and shows the taken-name message when the name is used", async () => {
    vi.mocked(createFolder).mockRejectedValue(new ApiError(409, "NAME_TAKEN", "taken"));
    const { onCreated } = renderDialog();
    fireEvent.change(screen.getByTestId("new-folder-name"), { target: { value: "holiday" } });

    fireEvent.click(screen.getByTestId("new-folder-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A file or folder with this name already exists here.",
    );
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByTestId("new-folder-dialog")).toHaveAttribute("open");
    expect(screen.getByTestId("new-folder-name")).toHaveValue("holiday");
  });
});
