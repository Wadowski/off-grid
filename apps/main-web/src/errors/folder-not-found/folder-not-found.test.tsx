// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FolderNotFound } from "./folder-not-found.js";

describe("FolderNotFound", () => {
  afterEach(() => {
    cleanup();
  });

  it("explains that the folder is not found and offers a way back to Files", () => {
    render(
      <MemoryRouter>
        <FolderNotFound />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("folder-not-found")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Folder not found" })).toBeInTheDocument();
    expect(screen.getByText("This file or folder is no longer available.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Files" })).toHaveAttribute("href", "/files");
  });
});
