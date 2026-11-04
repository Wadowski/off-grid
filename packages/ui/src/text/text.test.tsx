// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import type { ReactElement } from "react";
import { Text } from "./text.js";

const i18n = i18next.createInstance();
await i18n.init({
  lng: "en",
  resources: { en: { translation: { "greeting.hello": "Hello there" } } },
});

const renderWithI18n = (element: ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);

describe("Text", () => {
  it("renders a static text from its id through the translations", () => {
    renderWithI18n(<Text variant="body" textId="greeting.hello" />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("renders a dynamic value as given", () => {
    renderWithI18n(<Text variant="body" value="Lakeside" />);

    expect(screen.getByText("Lakeside")).toBeInTheDocument();
  });

  it("uses the element that matches its variant", () => {
    renderWithI18n(<Text variant="heading" value="Families" />);

    expect(screen.getByRole("heading", { level: 1, name: "Families" })).toBeInTheDocument();
  });

  it("passes attributes through to the element", () => {
    renderWithI18n(<Text variant="status" value="Saving" data-testid="status" role="status" />);

    expect(screen.getByTestId("status")).toHaveAttribute("role", "status");
  });

  it("lets an action label inherit the colour of the control it sits in", () => {
    renderWithI18n(<Text variant="action" value="Continue" data-testid="action" />);

    expect(screen.getByTestId("action")).toHaveAttribute(
      "style",
      expect.stringContaining("color: inherit"),
    );
  });

  it("styles each variant with its font token", () => {
    renderWithI18n(<Text variant="status" value="Saving" data-testid="status" />);

    expect(screen.getByTestId("status")).toHaveAttribute(
      "style",
      expect.stringContaining("var(--og-font-size-sm)"),
    );
  });
});
