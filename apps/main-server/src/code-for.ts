// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "./api-error.js";
import { hasValidationDetails } from "./has-validation-details.js";

export const codeFor = (error: unknown, status: number): string => {
  if (error instanceof ApiError) {
    return error.code;
  }
  if (hasValidationDetails(error)) {
    return "VALIDATION_FAILED";
  }
  if (status === 429) {
    return "RATE_LIMITED";
  }
  if (status === 404) {
    return "NOT_FOUND";
  }
  return "REQUEST_REJECTED";
};
