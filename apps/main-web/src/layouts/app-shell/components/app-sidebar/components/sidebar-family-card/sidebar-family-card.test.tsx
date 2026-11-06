// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { SidebarFamilyCard } from "./sidebar-family-card.js";

const families = [
  { id: "f1", name: "Lakeside" },
  { id: "f2", name: "Cabin" },
];

const renderCard = (cardFamilies: typeof families) =>
  render(
    <MemoryRouter>
      <SidebarFamilyCard families={cardFamilies} />
    </MemoryRouter>,
  );

describe("SidebarFamilyCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the first family, how many families the caller has, and a link to manage them", () => {
    renderCard(families);

    expect(screen.getByTestId("sidebar-family-card")).toHaveTextContent("Lakeside");
    expect(screen.getByTestId("sidebar-family-card")).toHaveTextContent("2 families");
    expect(screen.getByRole("link", { name: "Manage" })).toHaveAttribute("href", "/");
  });

  it("shows nothing when the caller has no families", () => {
    const { container } = renderCard([]);

    expect(container).toBeEmptyDOMElement();
  });
});
