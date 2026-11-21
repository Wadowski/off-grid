// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STREAM_FAILED_MESSAGE } from "./constants.js";

export const toStreamError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(STREAM_FAILED_MESSAGE);
