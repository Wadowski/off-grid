// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FolderEmpty } from "./folder-empty.js";

describe("FolderEmpty", () => {
  it("announces that the folder is empty and points to the Upload button", () => {
    render(<FolderEmpty />);

    const empty = screen.getByTestId("files-empty");
    expect(empty).toHaveAttribute("role", "status");
    expect(screen.getByRole("heading", { name: "This folder is empty" })).toBeInTheDocument();
    expect(empty).toHaveTextContent("Use Upload or New folder to add something.");
  });
});
