// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select.js";

const i18n = i18next.createInstance();
await i18n.init({
  lng: "en",
  resources: {
    en: { translation: { "role.label": "Role", "role.admin": "Administrator" } },
  },
});

const renderWithI18n = (element: ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

describe("Select", () => {
  it("renders one option per entry with its label", () => {
    renderWithI18n(<Select labelTextId="role.label" options={ROLE_OPTIONS} />);

    expect(screen.getByRole("option", { name: "Admin" })).toHaveValue("admin");
    expect(screen.getByRole("option", { name: "Member" })).toHaveValue("member");
  });

  it("names itself from its translated label", () => {
    renderWithI18n(<Select labelTextId="role.label" options={ROLE_OPTIONS} />);

    expect(screen.getByRole("combobox", { name: "Role" })).toBeInTheDocument();
  });

  it("renders option labels from their translation ids", () => {
    renderWithI18n(
      <Select
        labelTextId="role.label"
        options={[
          { value: "admin", labelTextId: "role.admin" },
          { value: "member", label: "Member" },
        ]}
      />,
    );

    expect(screen.getByRole("option", { name: "Administrator" })).toHaveValue("admin");
    expect(screen.getByRole("option", { name: "Member" })).toHaveValue("member");
  });

  it("reports the chosen value", () => {
    const onChange = vi.fn();
    renderWithI18n(
      <Select
        labelTextId="role.label"
        options={ROLE_OPTIONS}
        defaultValue="member"
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Role" }), {
      target: { value: "admin" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes its test id to the select", () => {
    renderWithI18n(
      <Select labelTextId="role.label" options={ROLE_OPTIONS} data-testid="role-select" />,
    );

    expect(screen.getByTestId("role-select").tagName).toBe("SELECT");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    renderWithI18n(<Select labelTextId="role.label" options={ROLE_OPTIONS} />);

    expect(screen.getByRole("combobox")).toHaveClass("og-focusable");
  });

  it("uses the shared form field class for the field variant", () => {
    renderWithI18n(<Select labelTextId="role.label" options={ROLE_OPTIONS} variant="field" />);

    expect(screen.getByRole("combobox")).toHaveClass("og-focusable", "og-select-field");
  });
});
