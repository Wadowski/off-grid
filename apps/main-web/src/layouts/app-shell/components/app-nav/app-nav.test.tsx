// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppNav } from "./app-nav.js";

describe("AppNav", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the family screen and lists the planned sections as unavailable", () => {
    render(
      <MemoryRouter>
        <AppNav />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getByRole("link", { name: "Family" })).toHaveAttribute("href", "/");
    expect(within(nav).getByText("Calendar").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(nav.querySelectorAll(".og-app-nav-item-disabled")).toHaveLength(5);
  });
});
