// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { errorResponseSchema } from "@offgrid/contracts";
import { ApiError } from "./api-error.js";

export const toApiError = async (response: Response): Promise<ApiError> => {
  const parsed = errorResponseSchema.safeParse(await response.json().catch(() => undefined));
  if (parsed.success) {
    return new ApiError(response.status, parsed.data.code, parsed.data.message);
  }
  return new ApiError(
    response.status,
    "UNEXPECTED_RESPONSE",
    response.statusText || "Request failed.",
  );
};
