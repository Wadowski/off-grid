// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FilesPage } from "./files-page.js";

describe("FilesPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the Files heading and the empty-state placeholder without loading any data", () => {
    render(<FilesPage />);

    expect(screen.getByTestId("files-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(screen.getByText("Your drives and folders will appear here.")).toBeInTheDocument();
  });
});
