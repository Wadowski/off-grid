// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilesHeader } from "./files-header.js";

describe("FilesHeader", () => {
  it("shows the drive name and an enabled Upload button", () => {
    render(<FilesHeader driveName="Personal" uploadDisabled={false} onFilesPicked={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Personal" })).toBeInTheDocument();
    expect(screen.getByTestId("files-upload-button")).toBeEnabled();
  });

  it("falls back to the Files heading when no drive is open", () => {
    render(<FilesHeader driveName={undefined} uploadDisabled onFilesPicked={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(screen.getByTestId("files-upload-button")).toBeDisabled();
  });

  it("passes the picked files to onFilesPicked", () => {
    const onFilesPicked = vi.fn();
    render(
      <FilesHeader driveName="Personal" uploadDisabled={false} onFilesPicked={onFilesPicked} />,
    );
    const file = new File(["a"], "a.txt");

    fireEvent.change(screen.getByTestId("files-upload-input"), { target: { files: [file] } });

    expect(onFilesPicked).toHaveBeenCalledWith([file]);
  });
});
