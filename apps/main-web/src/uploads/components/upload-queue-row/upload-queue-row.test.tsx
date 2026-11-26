// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UploadItem } from "../../types.js";
import { UploadQueueRow } from "./upload-queue-row.js";

const ITEM: UploadItem = {
  id: "1",
  familyId: null,
  name: "Holiday.txt",
  mimeType: "text/plain",
  sizeBytes: 5,
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadItem["driveId"],
  folderId: null,
  fileId: null,
  status: "queued",
  percent: 0,
  errorTextId: null,
  file: null,
};

const renderRow = (overrides: Partial<UploadItem>) =>
  render(
    <ul>
      <UploadQueueRow
        item={{ ...ITEM, ...overrides }}
        testIdPrefix="upload-queue-panel"
        canRetry={true}
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />
    </ul>,
  );

describe("UploadQueueRow", () => {
  it("shows the name and a waiting status while the file is queued", () => {
    renderRow({ status: "queued" });

    expect(screen.getByTestId("upload-queue-panel-row")).toHaveTextContent("Holiday.txt");
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Holiday.txt" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("shows the percent while the file uploads", () => {
    renderRow({ status: "uploading", percent: 42 });

    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByTestId("upload-queue-panel-progress")).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });

  it("shows uploaded with a check when the file is done", () => {
    renderRow({ status: "done", percent: 100 });

    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.queryByTestId("upload-queue-panel-progress")).toBeNull();
  });

  it("shows the error text of a failed file with an empty progress track", () => {
    renderRow({ status: "failed", percent: 60, errorTextId: "files.errors.payloadTooLarge" });

    expect(screen.getByTestId("upload-queue-panel-row")).toHaveTextContent(
      "This file is too large to upload.",
    );
    expect(screen.getByTestId("upload-queue-panel-progress")).toHaveAttribute("aria-valuenow", "0");
  });

  it("shows the generic failure text when the failure has no specific reason", () => {
    renderRow({ status: "failed", errorTextId: null });

    expect(screen.getByText("Something went wrong. Try again.")).toBeInTheDocument();
  });

  it("offers Retry and Dismiss only for a failed file", () => {
    renderRow({ status: "failed", errorTextId: "files.errors.failed" });

    expect(screen.getByRole("button", { name: "Retry upload of Holiday.txt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss Holiday.txt" })).toBeInTheDocument();
  });

  it("offers no action buttons while a file is still in the queue", () => {
    renderRow({ status: "uploading", percent: 10 });

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("passes the row id to the retry and dismiss handlers", () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <ul>
        <UploadQueueRow
          item={{ ...ITEM, status: "failed", errorTextId: "files.errors.failed" }}
          testIdPrefix="upload-queue-panel"
          canRetry={true}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      </ul>,
    );

    screen.getByTestId("upload-queue-panel-retry").click();
    screen.getByTestId("upload-queue-panel-dismiss").click();

    expect(onRetry).toHaveBeenCalledWith("1");
    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("offers no Retry for a file that a retry cannot fix", () => {
    render(
      <ul>
        <UploadQueueRow
          item={{ ...ITEM, status: "failed", errorTextId: "files.errors.payloadTooLarge" }}
          testIdPrefix="upload-queue-panel"
          canRetry={false}
          onRetry={vi.fn()}
          onDismiss={vi.fn()}
        />
      </ul>,
    );

    expect(screen.queryByTestId("upload-queue-panel-retry")).toBeNull();
    expect(screen.getByTestId("upload-queue-panel-dismiss")).toBeInTheDocument();
  });
});
