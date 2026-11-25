// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TopBarActions } from "./top-bar-actions.js";

const ACTIONS = {
  uploadDisabled: false,
  trashPath: null,
  onFilesPicked: vi.fn(),
  newFolderDisabled: false,
  onNewFolder: vi.fn(),
};

describe("TopBarActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("groups the folder actions under a labelled group", () => {
    render(<TopBarActions {...ACTIONS} />);

    expect(screen.getByRole("group", { name: "Folder actions" })).toBeInTheDocument();
  });

  it("enables Upload and New folder", () => {
    render(<TopBarActions {...ACTIONS} />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "New folder" })).toBeEnabled();
  });

  it("disables New folder while no folder is ready", () => {
    render(<TopBarActions {...ACTIONS} newFolderDisabled />);

    expect(screen.getByRole("button", { name: "New folder" })).toBeDisabled();
  });

  it("opens the new folder dialog from New folder", () => {
    const onNewFolder = vi.fn();
    render(<TopBarActions {...ACTIONS} onNewFolder={onNewFolder} />);

    fireEvent.click(screen.getByTestId("files-top-bar-new-folder"));

    expect(onNewFolder).toHaveBeenCalledOnce();
  });

  it("disables Upload while no folder is ready", () => {
    render(<TopBarActions {...ACTIONS} uploadDisabled />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();
  });

  it("gives each action a stable test id", () => {
    render(<TopBarActions {...ACTIONS} />);

    expect(screen.getByTestId("files-top-bar-upload")).toHaveAccessibleName("Upload");
    expect(screen.getByTestId("files-top-bar-new-folder")).toHaveAccessibleName("New folder");
  });

  it("opens the trash of the active drive from a Trash icon", () => {
    render(
      <MemoryRouter>
        <TopBarActions
          uploadDisabled={false}
          trashPath="/files/drive-1/trash"
          onFilesPicked={vi.fn()}
          newFolderDisabled={false}
          onNewFolder={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("files-top-bar-trash")).toHaveAttribute(
      "href",
      "/files/drive-1/trash",
    );
    expect(screen.getByRole("link", { name: "Open trash" })).toBeInTheDocument();
  });

  it("hides the Trash icon while no drive is active", () => {
    render(<TopBarActions {...ACTIONS} />);

    expect(screen.queryByTestId("files-top-bar-trash")).not.toBeInTheDocument();
  });
});
