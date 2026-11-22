// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { BackLink } from "./back-link.js";

const renderBackLink = () =>
  render(
    <MemoryRouter>
      <BackLink to="/files/drive/folder" parentName="Personal" />
    </MemoryRouter>,
  );

describe("BackLink", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the parent folder and names it", () => {
    renderBackLink();

    const link = screen.getByRole("link", { name: "Back to Personal" });
    expect(link).toHaveAttribute("href", "/files/drive/folder");
    expect(link).toHaveAttribute("data-testid", "files-back-link");
  });
});
