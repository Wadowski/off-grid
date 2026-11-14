// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarSidebarToggleRow } from "./calendar-sidebar-toggle-row.js";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

describe("CalendarSidebarToggleRow", () => {
  afterEach(() => {
    cleanup();
  });

  it("is checked when the calendar is shown", () => {
    render(<CalendarSidebarToggleRow calendar={STUDIO} checked onToggle={vi.fn()} />);

    expect(screen.getByRole("checkbox", { name: "Studio" })).toBeChecked();
  });

  it("is unchecked when the calendar is hidden", () => {
    render(<CalendarSidebarToggleRow calendar={STUDIO} checked={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("checkbox", { name: "Studio" })).not.toBeChecked();
  });

  it("reports the calendar id when the box is ticked", () => {
    const onToggle = vi.fn();
    render(<CalendarSidebarToggleRow calendar={STUDIO} checked onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Studio" }));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith(STUDIO.id);
  });

  it("hides the color dot from assistive technology", () => {
    const { container } = render(
      <CalendarSidebarToggleRow calendar={STUDIO} checked onToggle={vi.fn()} />,
    );

    expect(container.querySelector("span[aria-hidden='true']")).not.toBeNull();
  });
});
