// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useContext } from "react";
import type { UploadQueue } from "../types.js";
import { UploadQueueContext } from "./upload-queue-context.js";

export const useUploadQueueContext = (): UploadQueue => {
  const queue = useContext(UploadQueueContext);
  if (queue === undefined) {
    throw new Error("useUploadQueueContext must be used inside UploadQueueProvider");
  }
  return queue;
};
