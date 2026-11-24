// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import i18next from "i18next";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control.js";

const i18n = i18next.createInstance();
await i18n.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        "calendar.viewControl": "Calendar view",
        "calendar.views.agenda": "Agenda",
        "calendar.views.day": "Day",
        "calendar.views.week": "Week",
      },
    },
  },
});

const renderWithI18n = (element: ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);

const options = [
  { value: "agenda", label: "Agenda" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
] as const;

describe("SegmentedControl", () => {
  it("names the group and marks only the current option as pressed", () => {
    render(
      <SegmentedControl label="Calendar view" options={options} value="day" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("group", { name: "Calendar view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Agenda" })).toHaveAttribute("aria-pressed", "false");
  });

  it("names the group and the options from their translation ids", () => {
    renderWithI18n(
      <SegmentedControl
        labelTextId="calendar.viewControl"
        options={[
          { value: "agenda", labelTextId: "calendar.views.agenda" },
          { value: "day", labelTextId: "calendar.views.day" },
          { value: "week", labelTextId: "calendar.views.week" },
        ]}
        value="day"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: "Calendar view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports the chosen value when an unselected option is activated", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Calendar view" options={options} value="day" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Week" }));

    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("passes a test id per option", () => {
    render(
      <SegmentedControl
        label="Calendar view"
        options={options}
        value="agenda"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId("segmented-option-week")).toHaveTextContent("Week");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(
      <SegmentedControl
        label="Calendar view"
        options={options}
        value="agenda"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Agenda" })).toHaveClass("og-focusable");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SegmentedControl
        label="Calendar view"
        options={options}
        value="agenda"
        onChange={vi.fn()}
      />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
