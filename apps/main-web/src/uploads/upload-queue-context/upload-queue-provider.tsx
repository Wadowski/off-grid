// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useUploadQueue } from "../upload-queue-store/use-upload-queue.js";
import { UploadQueueContext } from "./upload-queue-context.js";
import type { UploadQueueProviderProps } from "../types.js";

export const UploadQueueProvider = ({ children }: UploadQueueProviderProps) => {
  const queue = useUploadQueue();
  return <UploadQueueContext.Provider value={queue}>{children}</UploadQueueContext.Provider>;
};
