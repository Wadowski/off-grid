// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TopBarActions } from "./top-bar-actions.js";

describe("TopBarActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("groups the folder actions under a labelled group", () => {
    render(<TopBarActions />);

    expect(screen.getByRole("group", { name: "Folder actions" })).toBeInTheDocument();
  });

  it("shows the Upload and New folder buttons disabled", () => {
    render(<TopBarActions />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "New folder" })).toBeDisabled();
  });

  it("gives each action a stable test id", () => {
    render(<TopBarActions />);

    expect(screen.getByTestId("files-top-bar-upload")).toHaveAccessibleName("Upload");
    expect(screen.getByTestId("files-top-bar-new-folder")).toHaveAccessibleName("New folder");
  });
});
