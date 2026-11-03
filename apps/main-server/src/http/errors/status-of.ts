// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readStatusCode } from "./read-status-code.js";

export const statusOf = (error: unknown): number => {
  const statusCode = readStatusCode(error);
  return statusCode !== undefined && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
};
