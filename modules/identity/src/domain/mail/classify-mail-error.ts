// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  MAIL_AUTH_ERROR_CODES,
  MAIL_AUTH_RESPONSE_CODES,
  MAIL_UNREACHABLE_ERROR_CODES,
} from "../../constants.js";
import type { MailFailureReason } from "../../types.js";
import { readErrorCode } from "./read-error-code.js";
import { readErrorResponseCode } from "./read-error-response-code.js";

export const classifyMailError = (error: unknown): MailFailureReason => {
  const code = readErrorCode(error);
  const responseCode = readErrorResponseCode(error);
  if (
    (code !== undefined && MAIL_AUTH_ERROR_CODES.has(code)) ||
    (responseCode !== undefined && MAIL_AUTH_RESPONSE_CODES.has(responseCode))
  ) {
    return "AUTH_REJECTED";
  }
  if (code !== undefined && MAIL_UNREACHABLE_ERROR_CODES.has(code)) {
    return "UNREACHABLE";
  }
  return "REJECTED";
};
