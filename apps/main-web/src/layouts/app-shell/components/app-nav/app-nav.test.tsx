// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppNav } from "./app-nav.js";

describe("AppNav", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the family screen and settings", () => {
    render(
      <MemoryRouter>
        <AppNav />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Family" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });
});
