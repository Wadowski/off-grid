// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { StatusFileCorruptError } from "./errors/status-file-corrupt-error.js";

export const parseStatusJson = (statusText: string): unknown => {
  try {
    return JSON.parse(statusText);
  } catch (cause) {
    throw new StatusFileCorruptError({ cause });
  }
};
