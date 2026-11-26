// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FolderLoading } from "./folder-loading.js";
import type { FolderLoadingLayout } from "./types.js";

const renderLoading = (layout: FolderLoadingLayout) => {
  const { container } = render(<FolderLoading layout={layout} />);
  return { container, status: screen.getByRole("status", { name: "Loading..." }) };
};

const placeholderCount = (container: HTMLElement) =>
  container.querySelectorAll("[aria-hidden='true'].og-pulse").length;

describe("FolderLoading", () => {
  it("announces a busy status named Loading... and keeps its test id", () => {
    const { status } = renderLoading("table");

    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveAttribute("data-testid", "files-folder-loading");
    expect(status).toHaveTextContent("Loading...");
  });

  it("draws table rows for the list layout", () => {
    const { container, status } = renderLoading("table");

    expect(placeholderCount(status)).toBe(6 * 4);
    expect(container.firstElementChild).toBe(status);
  });

  it("draws cards for the grid layout", () => {
    const { status } = renderLoading("grid");

    expect(placeholderCount(status)).toBe(8 * 2);
  });

  it("draws rows with an icon and two lines for the phone layout", () => {
    const { status } = renderLoading("phone");

    expect(placeholderCount(status)).toBe(6 * 3);
  });
});
