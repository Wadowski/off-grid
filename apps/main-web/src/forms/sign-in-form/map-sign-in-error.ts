// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { ServerUnreachableError } from "../../session/server-unreachable-error.js";
import type { SignInFailure } from "./types.js";

export const mapSignInError = (error: unknown): SignInFailure => {
  if (error instanceof ServerUnreachableError) {
    return { kind: "unreachable" };
  }
  if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
    return { kind: "invalidCredentials" };
  }
  return { kind: "failed" };
};
