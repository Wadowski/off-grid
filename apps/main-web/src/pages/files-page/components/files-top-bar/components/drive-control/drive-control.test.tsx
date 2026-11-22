// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { DriveControl } from "./drive-control.js";

const renderControl = (props: Parameters<typeof DriveControl>[0]) =>
  render(
    <MemoryRouter>
      <DriveControl {...props} />
    </MemoryRouter>,
  );

describe("DriveControl", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the drives page with the active drive name", () => {
    renderControl({ status: "ready", activeDriveName: "Personal" });

    const control = screen.getByTestId("files-top-bar-drive-control");
    expect(control).toHaveAttribute("href", "/files/drives");
    expect(control).toHaveTextContent("Drive");
    expect(screen.getByTestId("files-top-bar-drive-name")).toHaveTextContent("Personal");
  });

  it("shows the loading text while the drives load", () => {
    renderControl({ status: "loading", activeDriveName: null });

    expect(screen.getByTestId("files-top-bar-drive-control")).toHaveTextContent(
      "Loading drives...",
    );
    expect(screen.queryByTestId("files-top-bar-drive-name")).not.toBeInTheDocument();
  });

  it("shows the generic label when no active drive is resolved", () => {
    renderControl({ status: "failed", activeDriveName: null });

    const control = screen.getByTestId("files-top-bar-drive-control");
    expect(control).toHaveTextContent("Drives");
    expect(control).toHaveAttribute("href", "/files/drives");
  });

  it("keeps the focus ring class so the keyboard focus is visible", () => {
    renderControl({ status: "ready", activeDriveName: "Home" });

    expect(screen.getByTestId("files-top-bar-drive-control")).toHaveClass("og-focusable");
  });
});
