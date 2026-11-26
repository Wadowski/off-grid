// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UploadQueueRowActions } from "./upload-queue-row-actions.js";

const renderActions = (canRetry: boolean) => {
  const onRetry = vi.fn();
  const onDismiss = vi.fn();
  render(
    <UploadQueueRowActions
      name="Holiday.txt"
      testIdPrefix="upload-queue-panel"
      canRetry={canRetry}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />,
  );
  return { onRetry, onDismiss };
};

describe("UploadQueueRowActions", () => {
  it("offers Retry and Dismiss with the file name in their accessible names", () => {
    renderActions(true);

    expect(screen.getByRole("button", { name: "Retry upload of Holiday.txt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss Holiday.txt" })).toBeInTheDocument();
  });

  it("hides Retry when the failure cannot be fixed by a retry, but keeps Dismiss", () => {
    renderActions(false);

    expect(screen.queryByTestId("upload-queue-panel-retry")).toBeNull();
    expect(screen.getByTestId("upload-queue-panel-dismiss")).toBeInTheDocument();
  });

  it("calls the matching handler for each button", () => {
    const { onRetry, onDismiss } = renderActions(true);

    fireEvent.click(screen.getByTestId("upload-queue-panel-retry"));
    fireEvent.click(screen.getByTestId("upload-queue-panel-dismiss"));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
