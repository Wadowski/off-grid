// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "./api-error.js";

export const invalidHeader = (headerName: string): ApiError => {
  return new ApiError(400, "INVALID_IDENTITY_HEADER", `${headerName} must be a valid identifier`);
};
