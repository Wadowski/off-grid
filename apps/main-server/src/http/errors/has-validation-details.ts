// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const hasValidationDetails = (error: unknown): boolean => {
  return typeof error === "object" && error !== null && "validation" in error;
};
