// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadQueueState } from "./types.js";

export const EMPTY_UPLOAD_QUEUE_STATE: UploadQueueState = {
  items: [],
  lastDone: null,
  announcement: null,
};
