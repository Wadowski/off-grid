// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDetailsPanelStatus } from "./file-details-panel-status.js";

describe("FileDetailsPanelStatus", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the loading text while loading", () => {
    render(<FileDetailsPanelStatus kind="loading" />);

    expect(screen.getByTestId("file-details-panel-loading")).toHaveTextContent("Loading details");
  });

  it("shows the mapped error and calls onRetry when the retry button is pressed", () => {
    const onRetry = vi.fn(async () => undefined);
    render(
      <FileDetailsPanelStatus
        kind="failed"
        errorTextId="files.errors.notFound"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByTestId("file-details-panel-error")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
    fireEvent.click(screen.getByTestId("file-details-panel-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
