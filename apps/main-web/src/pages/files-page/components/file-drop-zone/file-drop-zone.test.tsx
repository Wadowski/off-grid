// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropZone } from "./file-drop-zone.js";

const filesTransfer = (file: File) => ({
  types: ["Files"],
  items: [{ kind: "file", getAsFile: () => file }],
  files: [file],
  dropEffect: "none",
});

const textTransfer = () => ({ types: ["text/plain"], items: [], files: [], dropEffect: "none" });

const renderZone = (
  enabled: boolean,
  onFilesDropped = vi.fn(),
  folderName: string | null = "Photos",
) => {
  render(
    <FileDropZone enabled={enabled} folderName={folderName} onFilesDropped={onFilesDropped}>
      <p>Folder contents</p>
    </FileDropZone>,
  );
  return onFilesDropped;
};

describe("FileDropZone", () => {
  it("shows the drop overlay while files are dragged over the file area", () => {
    renderZone(true);

    fireEvent.dragEnter(screen.getByTestId("files-drop-zone"), {
      dataTransfer: filesTransfer(new File(["a"], "a.txt")),
    });

    expect(screen.getByTestId("files-drop-overlay")).toBeInTheDocument();
    expect(screen.getByText("Drop files to upload")).toBeInTheDocument();
    expect(screen.getByText("Photos")).toBeInTheDocument();
  });

  it("names the drive when the file area is the drive root", () => {
    renderZone(true, vi.fn(), null);

    fireEvent.dragEnter(screen.getByTestId("files-drop-zone"), {
      dataTransfer: filesTransfer(new File(["a"], "a.txt")),
    });

    expect(
      screen.getByText("Release your files to upload them directly to this drive."),
    ).toBeInTheDocument();
  });

  it("hides the overlay when the drag leaves the file area", () => {
    renderZone(true);
    const zone = screen.getByTestId("files-drop-zone");
    fireEvent.dragEnter(zone, { dataTransfer: filesTransfer(new File(["a"], "a.txt")) });

    fireEvent.dragLeave(zone, { dataTransfer: filesTransfer(new File(["a"], "a.txt")) });

    expect(screen.queryByTestId("files-drop-overlay")).toBeNull();
  });

  it("does not show the overlay for a drag of text", () => {
    renderZone(true);

    fireEvent.dragEnter(screen.getByTestId("files-drop-zone"), { dataTransfer: textTransfer() });

    expect(screen.queryByTestId("files-drop-overlay")).toBeNull();
  });

  it("does not show the overlay while upload is disabled", () => {
    renderZone(false);

    fireEvent.dragEnter(screen.getByTestId("files-drop-zone"), {
      dataTransfer: filesTransfer(new File(["a"], "a.txt")),
    });

    expect(screen.queryByTestId("files-drop-overlay")).toBeNull();
  });

  it("passes the dropped files on and hides the overlay", () => {
    const file = new File(["a"], "a.txt");
    const onFilesDropped = renderZone(true);
    const zone = screen.getByTestId("files-drop-zone");
    fireEvent.dragEnter(zone, { dataTransfer: filesTransfer(file) });

    fireEvent.drop(zone, { dataTransfer: filesTransfer(file) });

    expect(onFilesDropped).toHaveBeenCalledWith([file]);
    expect(screen.queryByTestId("files-drop-overlay")).toBeNull();
  });

  it("keeps the folder contents rendered under the overlay", () => {
    renderZone(true);

    fireEvent.dragEnter(screen.getByTestId("files-drop-zone"), {
      dataTransfer: filesTransfer(new File(["a"], "a.txt")),
    });

    expect(screen.getByText("Folder contents")).toBeInTheDocument();
  });
});
