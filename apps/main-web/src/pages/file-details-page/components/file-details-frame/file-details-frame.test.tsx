// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FileDetailsFrame } from "./file-details-frame.js";

describe("FileDetailsFrame", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the header above its content", () => {
    render(
      <MemoryRouter>
        <FileDetailsFrame backTarget={{ to: "/files/drive/folder", name: "Personal" }}>
          <p>Content</p>
        </FileDetailsFrame>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("file-details-page")).toHaveTextContent("File details");
    expect(screen.getByRole("link", { name: "Back to Personal" })).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
