// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FileDetailsHeader } from "./file-details-header.js";

const renderHeader = (backTarget: Parameters<typeof FileDetailsHeader>[0]["backTarget"]) =>
  render(
    <MemoryRouter>
      <FileDetailsHeader backTarget={backTarget} />
    </MemoryRouter>,
  );

describe("FileDetailsHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the title and a back link named after the target folder", () => {
    renderHeader({ to: "/files/drive/folder/photos", name: "Photos" });

    expect(screen.getByRole("heading", { name: "File details" })).toBeInTheDocument();
    const back = screen.getByRole("link", { name: "Back to Photos" });
    expect(back).toHaveAttribute("href", "/files/drive/folder/photos");
    expect(back).toHaveAttribute("data-testid", "file-details-back");
  });

  it("shows only the title while the back target is not known", () => {
    renderHeader(null);

    expect(screen.getByRole("heading", { name: "File details" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
