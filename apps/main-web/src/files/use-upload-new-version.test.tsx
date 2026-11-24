// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUploadQueueContext } from "../uploads/index.js";
import type { UploadDone, VersionUploadTarget } from "../uploads/types.js";
import { useUploadNewVersion } from "./use-upload-new-version.js";
import type { FileEntry } from "./types.js";

vi.mock("../uploads/index.js", () => ({ useUploadQueueContext: vi.fn() }));

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const OTHER_FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileEntry["id"];
const TARGET: VersionUploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as VersionUploadTarget["driveId"],
  folderId: null,
  fileId: FILE_ID,
};
const doneFor = (fileId: FileEntry["id"] | null, itemId: string): UploadDone => ({
  itemId,
  driveId: TARGET.driveId,
  folderId: null,
  fileId,
});

const queueWith = (lastDone: UploadDone | null, enqueueVersion = vi.fn()) => ({
  enqueueVersion,
  lastDone,
});

beforeEach(() => {
  vi.mocked(useUploadQueueContext).mockReturnValue(queueWith(null) as never);
});

describe("useUploadNewVersion", () => {
  it("enqueues the picked file as a new version of the target file", () => {
    const enqueueVersion = vi.fn();
    vi.mocked(useUploadQueueContext).mockReturnValue(queueWith(null, enqueueVersion) as never);
    const file = new File(["hello"], "Trip.pdf");
    const { result } = renderHook(() => useUploadNewVersion(TARGET, vi.fn()));

    result.current(file);

    expect(enqueueVersion).toHaveBeenCalledWith(file, TARGET);
  });

  it("reports the upload of this file once its queue item is done", () => {
    const onUploaded = vi.fn();
    const { rerender } = renderHook(() => useUploadNewVersion(TARGET, onUploaded));
    expect(onUploaded).not.toHaveBeenCalled();

    vi.mocked(useUploadQueueContext).mockReturnValue(
      queueWith(doneFor(FILE_ID, "item-1")) as never,
    );
    rerender();

    expect(onUploaded).toHaveBeenCalledTimes(1);
  });

  it("ignores finished uploads of other files", () => {
    const onUploaded = vi.fn();
    vi.mocked(useUploadQueueContext).mockReturnValue(
      queueWith(doneFor(OTHER_FILE_ID, "item-2")) as never,
    );
    const { rerender } = renderHook(() => useUploadNewVersion(TARGET, onUploaded));

    rerender();

    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("ignores a finished upload that was already seen before mounting", () => {
    const onUploaded = vi.fn();
    vi.mocked(useUploadQueueContext).mockReturnValue(
      queueWith(doneFor(FILE_ID, "item-0")) as never,
    );

    renderHook(() => useUploadNewVersion(TARGET, onUploaded));

    expect(onUploaded).not.toHaveBeenCalled();
  });
});
