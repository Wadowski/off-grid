// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { Breadcrumb, Drive } from "../../../../../../files/types.js";
import { BreadcrumbItem } from "./breadcrumb-item.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER: Breadcrumb = {
  kind: "folder",
  id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as Breadcrumb["id"],
  name: "Photos",
} as Breadcrumb;
const DRIVE_CRUMB = { kind: "drive", id: DRIVE_ID, name: "Personal" } as Breadcrumb;

const renderItem = (props: { crumb: Breadcrumb; index: number; isCurrent: boolean }) =>
  render(
    <MemoryRouter>
      <ol>
        <BreadcrumbItem driveId={DRIVE_ID} {...props} />
      </ol>
    </MemoryRouter>,
  );

describe("BreadcrumbItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("links the drive crumb to the drive root", () => {
    renderItem({ crumb: DRIVE_CRUMB, index: 0, isCurrent: false });

    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder`,
    );
  });

  it("renders the current crumb as plain text with aria-current", () => {
    renderItem({ crumb: FOLDER, index: 1, isCurrent: true });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByTestId("files-breadcrumb-current")).toHaveAttribute("aria-current", "page");
  });

  it("does not show a separator before the first crumb", () => {
    const { container } = renderItem({ crumb: DRIVE_CRUMB, index: 0, isCurrent: false });

    expect(container.querySelector("[data-icon='chevron_right']")).toBeNull();
  });

  it("shows a decorative separator before the crumbs that follow the first", () => {
    const { container } = renderItem({ crumb: FOLDER, index: 1, isCurrent: false });

    expect(container.querySelector("[data-icon='chevron_right']")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
