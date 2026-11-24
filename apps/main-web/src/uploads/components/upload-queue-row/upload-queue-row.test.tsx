// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  status: "queued",
  percent: 0,
  errorTextId: null,
  file: null,
};

const renderRow = (overrides: Partial<UploadItem>, alertOnFailure = false) =>
  render(
    <ul>
      <UploadQueueRow
        item={{ ...ITEM, ...overrides }}
        testIdPrefix="upload-queue-inline"
        alertOnFailure={alertOnFailure}
      />
    </ul>,
  );

describe("UploadQueueRow", () => {
  it("shows the name and a waiting status while the file is queued", () => {
    renderRow({ status: "queued" });

    expect(screen.getByTestId("upload-queue-inline-row")).toHaveTextContent("Holiday.txt");
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Holiday.txt" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("shows the percent while the file uploads", () => {
    renderRow({ status: "uploading", percent: 42 });

    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByTestId("upload-queue-inline-progress")).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });

  it("shows uploaded with a check when the file is done", () => {
    renderRow({ status: "done", percent: 100 });

    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.getByTestId("upload-queue-inline-progress")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("shows the error text of a failed file with an empty progress track", () => {
    renderRow({ status: "failed", percent: 60, errorTextId: "files.errors.payloadTooLarge" }, true);

    const row = screen.getByTestId("upload-queue-inline-row");
    expect(within(row).getByRole("alert")).toHaveTextContent("This file is too large to upload.");
    expect(screen.getByTestId("upload-queue-inline-progress")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("does not mark the failure as an alert on the floating surface", () => {
    renderRow({ status: "failed", errorTextId: "files.errors.failed" }, false);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Something went wrong. Try again.")).toBeInTheDocument();
  });
});
