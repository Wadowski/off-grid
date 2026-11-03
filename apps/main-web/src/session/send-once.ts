// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionHeaders } from "./session-headers.js";

export const sendOnce = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  token: string | null,
): Promise<Response> =>
  fetch(input, { ...init, credentials: "include", headers: sessionHeaders(init?.headers, token) });
