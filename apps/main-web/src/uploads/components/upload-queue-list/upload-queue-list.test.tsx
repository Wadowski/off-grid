// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UploadItem } from "../../types.js";
import { UploadQueueList } from "./upload-queue-list.js";

const itemNamed = (name: string, status: UploadItem["status"]): UploadItem => ({
  id: name,
  familyId: null,
  name,
  mimeType: "text/plain",
  sizeBytes: 1,
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadItem["driveId"],
  folderId: null,
  fileId: null,
  status,
  percent: status === "done" ? 100 : 0,
  errorTextId: null,
  file: null,
});

describe("UploadQueueList", () => {
  it("lists every item as a row", () => {
    render(
      <UploadQueueList
        items={[itemNamed("a.txt", "done"), itemNamed("b.txt", "queued")]}
        testIdPrefix="upload-queue-panel"
        isIdle={false}
        onClearFinished={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("upload-queue-panel-row")).toHaveLength(2);
    expect(screen.getByRole("list", { name: "Upload queue" })).toBeInTheDocument();
  });

  it("offers Clear finished only when nothing is queued or uploading", () => {
    const { rerender } = render(
      <UploadQueueList
        items={[itemNamed("a.txt", "done")]}
        testIdPrefix="upload-queue-panel"
        isIdle={false}
        onClearFinished={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("upload-queue-panel-clear")).toBeNull();

    rerender(
      <UploadQueueList
        items={[itemNamed("a.txt", "done")]}
        testIdPrefix="upload-queue-panel"
        isIdle
        onClearFinished={vi.fn()}
      />,
    );
    expect(screen.getByTestId("upload-queue-panel-clear")).toHaveTextContent("Clear finished");
  });

  it("calls onClearFinished when Clear finished is pressed", () => {
    const onClearFinished = vi.fn();
    render(
      <UploadQueueList
        items={[itemNamed("a.txt", "done")]}
        testIdPrefix="upload-queue-panel"
        isIdle
        onClearFinished={onClearFinished}
      />,
    );

    fireEvent.click(screen.getByTestId("upload-queue-panel-clear"));

    expect(onClearFinished).toHaveBeenCalledTimes(1);
  });
});
