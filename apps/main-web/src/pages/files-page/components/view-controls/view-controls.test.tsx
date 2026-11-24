// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewControls } from "./view-controls.js";
import type { ViewControlsProps } from "./types.js";

const renderControls = (overrides: Partial<ViewControlsProps> = {}) => {
  const props: ViewControlsProps = {
    view: "list",
    sort: "name",
    direction: "asc",
    onChange: vi.fn(),
    ...overrides,
  };
  render(<ViewControls {...props} />);
  return props;
};

describe("ViewControls", () => {
  afterEach(() => {
    cleanup();
  });

  it("marks the current view as pressed", () => {
    renderControls({ view: "grid" });

    expect(screen.getByTestId("segmented-option-grid")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("segmented-option-list")).toHaveAttribute("aria-pressed", "false");
  });

  it("changes the view when an option is chosen", () => {
    const props = renderControls();

    fireEvent.click(screen.getByTestId("segmented-option-grid"));

    expect(props.onChange).toHaveBeenCalledWith({ view: "grid" });
  });

  it("changes the sort field when another field is chosen", () => {
    const props = renderControls();

    fireEvent.change(screen.getByTestId("files-sort-select"), { target: { value: "modified" } });

    expect(props.onChange).toHaveBeenCalledWith({ sort: "modified" });
  });

  it("reverses the direction with the direction button and names the next state", () => {
    const props = renderControls({ direction: "asc" });
    const button = screen.getByTestId("files-sort-direction");

    expect(button).toHaveAttribute("aria-label", "Sort descending");
    fireEvent.click(button);

    expect(props.onChange).toHaveBeenCalledWith({ direction: "desc" });
  });

  it("names the view and sort controls from their translations", () => {
    renderControls();

    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument();
  });

  it("names the ascending next state when the direction is descending", () => {
    renderControls({ direction: "desc" });

    expect(screen.getByTestId("files-sort-direction")).toHaveAttribute(
      "aria-label",
      "Sort ascending",
    );
  });
});
