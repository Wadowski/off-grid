// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { DriveSwitcherRow } from "./drive-switcher-row.js";

const renderRow = (props: Parameters<typeof DriveSwitcherRow>[0]) =>
  render(
    <MemoryRouter>
      <DriveSwitcherRow {...props} />
    </MemoryRouter>,
  );

describe("DriveSwitcherRow", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the drive folder and shows its name", () => {
    renderRow({ name: "The Smiths", kind: "family", to: "/files/drive-2/folder", active: false });

    const link = screen.getByRole("link", { name: "The Smiths" });
    expect(link).toHaveAttribute("href", "/files/drive-2/folder");
    expect(link).toHaveClass("og-focusable");
  });

  it("uses a lock icon for the personal drive", () => {
    renderRow({ name: "Personal", kind: "personal", to: "/files/drive-1/folder", active: false });

    const link = screen.getByTestId("drive-switcher-row");
    expect(link).toHaveAttribute("data-drive-kind", "personal");
    expect(link.querySelector("[data-icon='lock']")).not.toBeNull();
  });

  it("uses a shared-folder icon for a family drive", () => {
    renderRow({ name: "The Smiths", kind: "family", to: "/files/drive-2/folder", active: false });

    expect(
      screen.getByTestId("drive-switcher-row").querySelector("[data-icon='folder_shared']"),
    ).not.toBeNull();
  });

  it("marks the active drive with aria-current and a check icon", () => {
    renderRow({ name: "Personal", kind: "personal", to: "/files/drive-1/folder", active: true });

    const link = screen.getByRole("link", { name: "Personal" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.querySelector("[data-icon='check_circle']")).not.toBeNull();
  });

  it("does not mark an inactive drive as current", () => {
    renderRow({ name: "The Smiths", kind: "family", to: "/files/drive-2/folder", active: false });

    const link = screen.getByRole("link", { name: "The Smiths" });
    expect(link).not.toHaveAttribute("aria-current");
    expect(link.querySelector("[data-icon='check_circle']")).toBeNull();
  });
});
