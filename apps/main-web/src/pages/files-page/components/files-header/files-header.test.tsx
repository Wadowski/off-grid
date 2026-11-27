// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilesHeader } from "./files-header.js";

describe("FilesHeader", () => {
  it("shows the drive name and an enabled Upload button", () => {
    render(
      <FilesHeader
        driveName="Personal"
        uploadDisabled={false}
        onFilesPicked={vi.fn()}
        newFolderDisabled={false}
        onNewFolder={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Personal" })).toBeInTheDocument();
    expect(screen.getByTestId("files-upload-button")).toBeEnabled();
  });

  it("falls back to the Files heading when no drive is open", () => {
    render(
      <FilesHeader
        driveName={undefined}
        uploadDisabled
        onFilesPicked={vi.fn()}
        newFolderDisabled
        onNewFolder={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(screen.getByTestId("files-upload-button")).toBeDisabled();
  });

  it("shows a secondary New folder button beside Upload that opens the dialog", () => {
    const onNewFolder = vi.fn();
    render(
      <FilesHeader
        driveName="Personal"
        uploadDisabled={false}
        onFilesPicked={vi.fn()}
        newFolderDisabled={false}
        onNewFolder={onNewFolder}
      />,
    );

    fireEvent.click(screen.getByTestId("files-new-folder-button"));

    expect(onNewFolder).toHaveBeenCalledOnce();
    expect(screen.getByTestId("files-new-folder-button")).toHaveAccessibleName("New folder");
  });

  it("disables New folder while no folder is open", () => {
    render(
      <FilesHeader
        driveName={undefined}
        uploadDisabled
        onFilesPicked={vi.fn()}
        newFolderDisabled
        onNewFolder={vi.fn()}
      />,
    );

    expect(screen.getByTestId("files-new-folder-button")).toBeDisabled();
  });

  it("shows the choose-a-drive hint and links the disabled controls to it when no drive is open", () => {
    render(
      <FilesHeader
        driveName={undefined}
        uploadDisabled
        onFilesPicked={vi.fn()}
        newFolderDisabled
        onNewFolder={vi.fn()}
        noDrive
        describedBy="files-no-drive-hint"
      />,
    );

    expect(screen.getByText("Choose a drive to upload files.")).toHaveAttribute(
      "id",
      "files-no-drive-hint",
    );
    expect(screen.getByTestId("files-upload-button")).toHaveAttribute(
      "aria-describedby",
      "files-no-drive-hint",
    );
    expect(screen.getByTestId("files-new-folder-button")).toHaveAttribute(
      "aria-describedby",
      "files-no-drive-hint",
    );
  });

  it("shows no hint and links no control when a drive is open", () => {
    render(
      <FilesHeader
        driveName="Personal"
        uploadDisabled={false}
        onFilesPicked={vi.fn()}
        newFolderDisabled={false}
        onNewFolder={vi.fn()}
      />,
    );

    expect(screen.queryByText("Choose a drive to upload files.")).not.toBeInTheDocument();
    expect(screen.getByTestId("files-upload-button")).not.toHaveAttribute("aria-describedby");
  });

  it("passes the picked files to onFilesPicked", () => {
    const onFilesPicked = vi.fn();
    render(
      <FilesHeader
        driveName="Personal"
        uploadDisabled={false}
        onFilesPicked={onFilesPicked}
        newFolderDisabled={false}
        onNewFolder={vi.fn()}
      />,
    );
    const file = new File(["a"], "a.txt");

    fireEvent.change(screen.getByTestId("files-upload-input"), { target: { files: [file] } });

    expect(onFilesPicked).toHaveBeenCalledWith([file]);
  });
});
