// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const requestHeaders = (
  body: unknown,
  extraHeaders: Readonly<Record<string, string>> = {},
): Record<string, string> => {
  if (body === undefined) {
    return { accept: "application/json", ...extraHeaders };
  }
  return { accept: "application/json", "content-type": "application/json", ...extraHeaders };
};
