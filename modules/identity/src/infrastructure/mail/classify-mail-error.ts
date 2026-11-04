// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailFailureReason } from "../../types.js";

const AUTH_CODES: ReadonlySet<string> = new Set(["EAUTH"]);
const AUTH_RESPONSE_CODES: ReadonlySet<number> = new Set([534, 535]);
const UNREACHABLE_CODES: ReadonlySet<string> = new Set([
  "ECONNECTION",
  "ETIMEDOUT",
  "ESOCKET",
  "EDNS",
]);

const readCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  return typeof error.code === "string" ? error.code : undefined;
};

const readResponseCode = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("responseCode" in error)) {
    return undefined;
  }
  return typeof error.responseCode === "number" ? error.responseCode : undefined;
};

export const classifyMailError = (error: unknown): MailFailureReason => {
  const code = readCode(error);
  const responseCode = readResponseCode(error);
  if (
    (code !== undefined && AUTH_CODES.has(code)) ||
    (responseCode !== undefined && AUTH_RESPONSE_CODES.has(responseCode))
  ) {
    return "AUTH_REJECTED";
  }
  if (code !== undefined && UNREACHABLE_CODES.has(code)) {
    return "UNREACHABLE";
  }
  return "REJECTED";
};
