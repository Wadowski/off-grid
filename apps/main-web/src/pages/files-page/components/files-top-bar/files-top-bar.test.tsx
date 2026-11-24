// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { Drive } from "../../../../files/types.js";
import { FilesTopBar } from "./files-top-bar.js";

const PERSONAL: Drive = {
  id: "drive-1",
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;
const HOME: Drive = {
  id: "drive-2",
  familyId: "family-1",
  name: "Home",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;

const renderTopBar = (props: Parameters<typeof FilesTopBar>[0]) =>
  render(
    <MemoryRouter>
      <FilesTopBar {...props} />
    </MemoryRouter>,
  );

describe("FilesTopBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the active drive name and the folder actions in one row", () => {
    renderTopBar({
      drives: [PERSONAL, HOME],
      status: "ready",
      activeDriveId: HOME.id,
      uploadDisabled: false,
      onFilesPicked: () => undefined,
    });

    const row = screen.getByTestId("files-top-bar");
    expect(row).toContainElement(screen.getByTestId("files-top-bar-drive-control"));
    expect(row).toContainElement(screen.getByTestId("files-top-bar-actions"));
    expect(screen.getByTestId("files-top-bar-drive-name")).toHaveTextContent("Home");
  });

  it("shows the generic drive label when no drive matches the active drive id", () => {
    renderTopBar({
      drives: [PERSONAL],
      status: "ready",
      activeDriveId: null,
      uploadDisabled: false,
      onFilesPicked: () => undefined,
    });

    expect(screen.getByTestId("files-top-bar-drive-control")).toHaveTextContent("Drives");
  });

  it("shows the loading text while the drives load", () => {
    renderTopBar({
      drives: [],
      status: "loading",
      activeDriveId: null,
      uploadDisabled: true,
      onFilesPicked: () => undefined,
    });

    expect(screen.getByTestId("files-top-bar-drive-control")).toHaveTextContent(
      "Loading drives...",
    );
  });
});
