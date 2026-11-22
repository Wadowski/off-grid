// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isGetOf = (
  init: RequestInit | undefined,
  path: string,
  input: RequestInfo | URL,
): boolean =>
  (init?.method ?? "GET") === "GET" &&
  new URL(String(input), "http://localhost").pathname.endsWith(path);
