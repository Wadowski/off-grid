// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const requestHeaders = (body: unknown): Record<string, string> => {
  if (body === undefined) {
    return { accept: "application/json" };
  }
  return { accept: "application/json", "content-type": "application/json" };
};
