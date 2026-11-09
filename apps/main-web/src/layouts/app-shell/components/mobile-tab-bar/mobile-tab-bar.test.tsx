// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { MobileTabBar } from "./mobile-tab-bar.js";

describe("MobileTabBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers exactly Apps, Family and Settings", () => {
    render(
      <MemoryRouter>
        <MobileTabBar />
      </MemoryRouter>,
    );

    const bar = screen.getByTestId("mobile-tab-bar");
    const links = within(bar).getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(within(bar).getByRole("link", { name: /Apps/ })).toHaveAttribute("href", "/apps");
    expect(within(bar).getByRole("link", { name: /Family/ })).toHaveAttribute("href", "/");
    expect(within(bar).getByRole("link", { name: /Settings/ })).toHaveAttribute(
      "href",
      "/settings",
    );
  });
});
