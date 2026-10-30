// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ErrorBody } from "./types.js";

export const notFoundBody = (): ErrorBody => {
  return { code: "NOT_FOUND", message: "Route not found" };
};
