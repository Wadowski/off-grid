// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ErrorBody } from "./types.js";

const MAX_MESSAGE_LENGTH = 500;
const INTERNAL_MESSAGE = "Internal server error";
const GENERIC_REJECTION_MESSAGE = "Request rejected";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function statusOf(error: unknown): number {
  const statusCode = readStatusCode(error);
  return statusCode !== undefined && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
}

export function errorBodyFor(error: unknown, status: number): ErrorBody {
  if (status >= 500) {
    return { code: "INTERNAL_ERROR", message: INTERNAL_MESSAGE };
  }
  return {
    code: codeFor(error, status),
    message: messageFor(error),
  };
}

export function notFoundBody(): ErrorBody {
  return { code: "NOT_FOUND", message: "Route not found" };
}

function codeFor(error: unknown, status: number): string {
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
}

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError) && !hasValidationDetails(error)) {
    return GENERIC_REJECTION_MESSAGE;
  }
  const message = error instanceof Error ? error.message.trim() : "";
  const safe = message.length > 0 ? message : GENERIC_REJECTION_MESSAGE;
  return safe.slice(0, MAX_MESSAGE_LENGTH);
}

function readStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return undefined;
  }
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

function hasValidationDetails(error: unknown): boolean {
  return typeof error === "object" && error !== null && "validation" in error;
}
