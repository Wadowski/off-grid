// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Drive } from "../../../../files/types.js";
import { DriveSwitcher } from "./drive-switcher.js";
import type { DriveSwitcherProps } from "./types.js";

const PERSONAL: Drive = driveSchema.parse({
  id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
});
const SMITHS: Drive = driveSchema.parse({
  id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  familyId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "The Smiths",
  createdAt: "2026-01-02T00:00:00.000Z",
});
const GARDEN: Drive = driveSchema.parse({
  id: "7e8f9a0b-1c2d-4e3f-8a4b-5c6d7e8f9a0b",
  familyId: "1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a",
  name: "Garden Club",
  createdAt: "2026-01-03T00:00:00.000Z",
});

const renderSwitcher = (props: Partial<DriveSwitcherProps> = {}) => {
  const onRetry = vi.fn();
  render(
    <MemoryRouter>
      <DriveSwitcher
        drives={[PERSONAL, SMITHS]}
        status="ready"
        errorTextId={null}
        activeDriveId={PERSONAL.id}
        onRetry={onRetry}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onRetry };
};

const rowNames = () =>
  screen
    .getAllByTestId("drive-switcher-row")
    .map((row) => within(row).getByTestId("drive-switcher-row-name").textContent ?? "");

describe("DriveSwitcher", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the personal drive first, then the family drives, in a named navigation", () => {
    renderSwitcher({ drives: [SMITHS, PERSONAL, GARDEN] });

    const sidebar = screen.getByRole("complementary", { name: "Drives" });
    expect(within(sidebar).getByRole("navigation", { name: "Drives" })).toBeInTheDocument();
    expect(rowNames()).toEqual(["Personal", "The Smiths", "Garden Club"]);
  });

  it("links each row to the folder page of its drive", () => {
    renderSwitcher();

    expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "href",
      `/files/${PERSONAL.id}/folder`,
    );
    expect(screen.getByRole("link", { name: "The Smiths" })).toHaveAttribute(
      "href",
      `/files/${SMITHS.id}/folder`,
    );
  });

  it("marks only the active drive as the current page", () => {
    renderSwitcher({ activeDriveId: SMITHS.id });

    expect(screen.getByRole("link", { name: "The Smiths" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Personal" })).not.toHaveAttribute("aria-current");
  });

  it("shows the empty family text when the person has no family drive", () => {
    renderSwitcher({ drives: [PERSONAL] });

    expect(screen.getByText("No family drives yet.")).toBeInTheDocument();
    expect(screen.getAllByTestId("drive-switcher-row")).toHaveLength(1);
  });

  it("shows a loading status without a list while the drives load", () => {
    renderSwitcher({ drives: [], status: "loading" });

    expect(screen.getByTestId("drive-switcher-loading")).toHaveTextContent("Loading drives...");
    expect(screen.queryByTestId("drive-switcher-row")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Drives" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows the failure text and calls the retry handler when Try again is chosen", () => {
    const { onRetry } = renderSwitcher({
      drives: [],
      status: "failed",
      errorTextId: "files.errors.failed",
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    fireEvent.click(screen.getByTestId("drive-switcher-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders no storage figures", () => {
    renderSwitcher({ drives: [PERSONAL, SMITHS] });

    expect(screen.queryByText(/GB|MB|%/)).not.toBeInTheDocument();
  });
});
