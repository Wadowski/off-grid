// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TopBarActions } from "./top-bar-actions.js";
import { vi } from "vitest";

describe("TopBarActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("groups the folder actions under a labelled group", () => {
    render(<TopBarActions uploadDisabled={false} onFilesPicked={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Folder actions" })).toBeInTheDocument();
  });

  it("enables Upload and keeps New folder disabled", () => {
    render(<TopBarActions uploadDisabled={false} onFilesPicked={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "New folder" })).toBeDisabled();
  });

  it("disables Upload while no folder is ready", () => {
    render(<TopBarActions uploadDisabled onFilesPicked={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();
  });

  it("gives each action a stable test id", () => {
    render(<TopBarActions uploadDisabled={false} onFilesPicked={vi.fn()} />);

    expect(screen.getByTestId("files-top-bar-upload")).toHaveAccessibleName("Upload");
    expect(screen.getByTestId("files-top-bar-new-folder")).toHaveAccessibleName("New folder");
  });
});
