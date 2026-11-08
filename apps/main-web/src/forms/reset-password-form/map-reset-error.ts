// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { PASSWORD_ERROR_TEXT_IDS } from "../../constants.js";
import type { ResetFailure } from "./types.js";

const CODE_INVALID_CODES = new Set(["INVALID_RECOVERY_CODE", "INVALID_RESET_CODE"]);

export const mapResetError = (error: unknown): ResetFailure => {
  if (!(error instanceof ApiError)) {
    return { kind: "failed" };
  }
  if (CODE_INVALID_CODES.has(error.code)) {
    return { kind: "codeInvalid" };
  }
  if (error.code === "RECOVERY_LOCKED") {
    return { kind: "locked" };
  }
  const passwordTextId = PASSWORD_ERROR_TEXT_IDS.get(error.code);
  if (passwordTextId !== undefined) {
    return { kind: "password", textId: passwordTextId };
  }
  return { kind: "failed" };
};
