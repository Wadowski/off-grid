// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { retryAfterRenewal } from "./retry-after-renewal.js";
import { sendOnce } from "./send-once.js";

export const sendWithSession = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
  retryAfterRenewal((token) => sendOnce(input, init, token));
