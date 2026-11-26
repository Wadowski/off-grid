// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DropOverlay } from "./drop-overlay.js";

describe("DropOverlay", () => {
  it("is hidden from assistive technology because the Upload button is the alternative", () => {
    render(<DropOverlay folderName="Photos" />);

    expect(screen.getByTestId("files-drop-overlay")).toHaveAttribute("aria-hidden", "true");
  });

  it("names the open folder in the hint", () => {
    render(<DropOverlay folderName="Photos" />);

    expect(screen.getByText("Photos")).toBeInTheDocument();
    expect(screen.getByText("folder.", { exact: false })).toBeInTheDocument();
  });
});
