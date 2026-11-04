// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const readErrorResponseCode = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("responseCode" in error)) {
    return undefined;
  }
  return typeof error.responseCode === "number" ? error.responseCode : undefined;
};
