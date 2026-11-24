// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { uploadFile } from "../../files/files-api.js";
import { toFilesErrorTextId } from "../../files/to-files-error-text-id.js";
import { clearRunningUpload } from "./clear-running-upload.js";
import { toUploadPercent } from "./to-upload-percent.js";
import type { RunningUploadRef, UploadDispatch, UploadItem } from "../types.js";

export const startUpload = (
  item: UploadItem,
  file: File,
  dispatch: UploadDispatch,
  running: RunningUploadRef,
): void => {
  const controller = new AbortController();
  running.current = { id: item.id, controller };
  dispatch({ type: "started", id: item.id });
  uploadFile(item.driveId, {
    file,
    parentId: item.folderId ?? undefined,
    signal: controller.signal,
    onProgress: (loaded, total) =>
      dispatch({ type: "progressed", id: item.id, percent: toUploadPercent(loaded, total) }),
  })
    .then(() => {
      clearRunningUpload(running, item.id);
      dispatch({ type: "finished", id: item.id });
    })
    .catch((error: unknown) => {
      if (controller.signal.aborted) {
        return;
      }
      clearRunningUpload(running, item.id);
      dispatch({ type: "failed", id: item.id, errorTextId: toFilesErrorTextId(error) });
    });
};
