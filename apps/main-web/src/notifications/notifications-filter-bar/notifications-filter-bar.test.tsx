// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NotificationsLayout } from "../types.js";
import { NotificationsFilterBar } from "./notifications-filter-bar.js";

const renderBar = (layout: NotificationsLayout, onSelect = vi.fn()) =>
  render(
    <NotificationsFilterBar
      layout={layout}
      selectedOption="all"
      totalForSelected={7}
      onSelect={onSelect}
    />,
  );

describe("NotificationsFilterBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the sort label on desktop", () => {
    renderBar("desktop");

    expect(screen.getByText("Newest first")).toBeInTheDocument();
  });

  it("hides the sort label and keeps the chips in one scrolling row on phone", () => {
    renderBar("phone");

    expect(screen.queryByText("Newest first")).toBeNull();
    const chips = screen.getByTestId("notifications-filter-all").parentElement!;
    expect(chips).toHaveStyle({ flexWrap: "nowrap", overflowX: "auto" });
  });

  it("shows the selected chip's total and selects another filter on phone", () => {
    const onSelect = vi.fn();
    renderBar("phone", onSelect);

    expect(screen.getByTestId("notifications-filter-all")).toHaveTextContent(/^All 7$/);
    fireEvent.click(screen.getByTestId("notifications-filter-unread"));

    expect(onSelect).toHaveBeenCalledWith("unread");
  });

  it("keeps the popover chips in one row and hides the sort label", () => {
    renderBar("popover");

    expect(screen.queryByText("Newest first")).toBeNull();
    const chips = screen.getByTestId("notifications-filter-all").parentElement!;
    expect(chips).toHaveStyle({ flexWrap: "nowrap", overflowX: "auto" });
  });
});
