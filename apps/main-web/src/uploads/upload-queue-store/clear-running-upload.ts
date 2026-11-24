// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RunningUploadRef } from "../types.js";

export const clearRunningUpload = (running: RunningUploadRef, id: string): void => {
  if (running.current?.id === id) {
    running.current = null;
  }
};
