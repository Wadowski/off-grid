// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { Breadcrumb, Drive } from "../../../../files/types.js";
import { Breadcrumbs } from "./breadcrumbs.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const SUMMER_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const BREADCRUMBS = [
  { kind: "drive", id: DRIVE_ID, name: "Personal" },
  { kind: "folder", id: PHOTOS_ID, name: "Photos" },
  { kind: "folder", id: SUMMER_ID, name: "Summer" },
] as Breadcrumb[];

const renderBreadcrumbs = (breadcrumbs: Breadcrumb[], isBusy = false) =>
  render(
    <MemoryRouter>
      <Breadcrumbs driveId={DRIVE_ID} breadcrumbs={breadcrumbs} isBusy={isBusy} />
    </MemoryRouter>,
  );

describe("Breadcrumbs", () => {
  afterEach(() => {
    cleanup();
  });

  it("is a labelled navigation landmark with an ordered list of crumbs in path order", () => {
    renderBreadcrumbs(BREADCRUMBS);

    const nav = screen.getByRole("navigation", { name: "Folder path" });
    const crumbs = within(nav).getAllByRole("listitem");
    expect(crumbs).toHaveLength(3);
    expect(within(nav).getByRole("list")).toBeInTheDocument();
    expect(crumbs[0]).toHaveTextContent("Personal");
    expect(crumbs[1]).toHaveTextContent("Photos");
    expect(crumbs[2]).toHaveTextContent("Summer");
  });

  it("links every crumb except the last to its level", () => {
    renderBreadcrumbs(BREADCRUMBS);

    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder`,
    );
    expect(screen.getByRole("link", { name: "Photos" })).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder/${PHOTOS_ID}`,
    );
  });

  it("shows the last crumb as the current page and not as a link", () => {
    renderBreadcrumbs(BREADCRUMBS);

    const current = screen.getByTestId("files-breadcrumb-current");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveTextContent("Summer");
    expect(screen.queryByRole("link", { name: "Summer" })).not.toBeInTheDocument();
  });

  it("marks the list busy while the path is loading", () => {
    renderBreadcrumbs([], true);

    expect(screen.getByRole("navigation", { name: "Folder path" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
