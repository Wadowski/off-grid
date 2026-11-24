// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImagePreviewer } from "./image-previewer.js";

afterEach(cleanup);

describe("ImagePreviewer", () => {
  it("shows the object URL as an image named after the file", () => {
    render(
      <ImagePreviewer
        objectUrl="blob:http://localhost/beach"
        name="Beach.png"
        download={vi.fn()}
      />,
    );

    const image = screen.getByRole("img", { name: "Beach.png" });
    expect(image).toHaveAttribute("src", "blob:http://localhost/beach");
    expect(image).toHaveAttribute("data-testid", "file-preview-image");
  });
});
