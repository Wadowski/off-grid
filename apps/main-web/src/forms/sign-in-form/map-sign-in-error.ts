// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import type { SignInFailure } from "./types.js";

export const mapSignInError = (error: unknown): SignInFailure => {
  if (error instanceof ApiError) {
    return error.code === "INVALID_CREDENTIALS"
      ? { kind: "invalidCredentials" }
      : { kind: "failed" };
  }
  if (error instanceof TypeError) {
    return { kind: "unreachable" };
  }
  return { kind: "failed" };
};
