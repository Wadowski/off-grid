// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { ItemNotFound } from "./item-not-found.js";

describe("ItemNotFound", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    { kind: "file", heading: "File not found" },
    { kind: "folder", heading: "Folder not found" },
  ] as const)(
    "explains that the $kind is not found and offers a way back to Files",
    ({ kind, heading }) => {
      render(
        <MemoryRouter>
          <ItemNotFound kind={kind} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId(`${kind}-not-found`)).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      expect(screen.getByText("This file or folder is no longer available.")).toBeInTheDocument();
      expect(screen.getByTestId(`${kind}-not-found-back`)).toHaveAttribute("href", "/files");
      expect(screen.getByRole("link", { name: "Go to Files" })).toHaveAttribute("href", "/files");
    },
  );

  it("announces a folder that is not found as an alert", () => {
    render(
      <MemoryRouter>
        <ItemNotFound kind="folder" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toHaveAttribute("data-testid", "folder-not-found");
  });
});
