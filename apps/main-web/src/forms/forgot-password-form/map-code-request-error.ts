// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import type { ForgotPasswordStatus } from "./types.js";

export const mapCodeRequestError = (error: unknown): ForgotPasswordStatus =>
  error instanceof ApiError && error.code === "EMAIL_NOT_CONFIGURED"
    ? "emailNotConfigured"
    : "failed";
