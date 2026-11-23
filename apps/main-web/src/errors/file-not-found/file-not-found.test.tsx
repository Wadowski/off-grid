// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FileNotFound } from "./file-not-found.js";

describe("FileNotFound", () => {
  afterEach(() => {
    cleanup();
  });

  it("explains that the file is not found and offers a way back to Files", () => {
    render(
      <MemoryRouter>
        <FileNotFound />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("file-not-found")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "File not found" })).toBeInTheDocument();
    expect(screen.getByText("This file or folder is no longer available.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Files" })).toHaveAttribute("href", "/files");
  });
});
