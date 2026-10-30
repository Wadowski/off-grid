// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ErrorRecord } from "./types.js";

export const dropOldest = (records: ErrorRecord[], capacity: number): void => {
  if (records.length > capacity) {
    records.splice(0, records.length - capacity);
  }
};
