// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FolderLoadFailed } from "./folder-load-failed.js";

describe("FolderLoadFailed", () => {
  it("announces the mapped error as an alert with a Try again button", () => {
    render(<FolderLoadFailed errorTextId="files.errors.failed" onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    expect(screen.getByRole("button", { name: "Try again" })).toHaveAttribute(
      "data-testid",
      "files-retry",
    );
  });

  it("calls the retry handler when Try again is pressed", () => {
    const onRetry = vi.fn();
    render(<FolderLoadFailed errorTextId="files.errors.notFound" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
