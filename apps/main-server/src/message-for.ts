// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "./api-error.js";
import { hasValidationDetails } from "./has-validation-details.js";
import { GENERIC_REJECTION_MESSAGE, MAX_MESSAGE_LENGTH } from "./constants.js";

export const messageFor = (error: unknown): string => {
  if (!(error instanceof ApiError) && !hasValidationDetails(error)) {
    return GENERIC_REJECTION_MESSAGE;
  }
  const message = error instanceof Error ? error.message.trim() : "";
  const safe = message.length > 0 ? message : GENERIC_REJECTION_MESSAGE;
  return safe.slice(0, MAX_MESSAGE_LENGTH);
};
