// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage, StoredObject } from "@offgrid/file-storage";
import { limitUploadStream } from "../../domain/files/limit-upload-stream.js";
import { UploadTooLargeError } from "../errors/upload-too-large-error.js";

export const storeLimitedUpload = (
  storage: FileStorage,
  maxUploadBytes: number,
  body: AsyncIterable<Uint8Array>,
  signal: AbortSignal,
): Promise<StoredObject> =>
  storage.put(
    limitUploadStream(body, maxUploadBytes, () => new UploadTooLargeError()),
    {
      signal,
    },
  );
