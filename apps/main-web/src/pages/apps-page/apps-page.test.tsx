// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppsPage } from "./apps-page.js";

describe("AppsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the apps, linking the ones that exist and marking the planned ones unavailable", () => {
    const { container } = render(
      <MemoryRouter>
        <AppsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Apps" })).toBeInTheDocument();
    const list = screen.getByTestId("apps-list");
    const links = within(list).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/calendar", "/settings"]);
    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(4);
  });
});
