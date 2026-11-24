// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { uploadFile } from "../../../../files/files-api.js";
import { useUploadQueueContext, UploadQueueProvider } from "../../../../uploads/index.js";
import { UploadQueueCard } from "./upload-queue-card.js";

vi.mock("../../../../files/files-api.js", () => ({ uploadFile: vi.fn() }));

const TARGET = { driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as never, folderId: null };

const AddFile = () => {
  const queue = useUploadQueueContext();
  return (
    <button type="button" onClick={() => queue.enqueue([new File(["x"], "Holiday.txt")], TARGET)}>
      add
    </button>
  );
};

describe("UploadQueueCard", () => {
  it("is not rendered while the queue is empty", () => {
    render(
      <UploadQueueProvider>
        <UploadQueueCard />
      </UploadQueueProvider>,
    );

    expect(screen.queryByTestId("upload-queue-inline")).toBeNull();
  });

  it("lists the queued files with their heading", () => {
    vi.mocked(uploadFile).mockReturnValue(new Promise(() => undefined) as never);
    render(
      <UploadQueueProvider>
        <AddFile />
        <UploadQueueCard />
      </UploadQueueProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "add" }));

    expect(screen.getByTestId("upload-queue-inline")).toHaveTextContent("Uploads");
    expect(screen.getByTestId("upload-queue-inline-row")).toHaveTextContent("Holiday.txt");
  });
});
