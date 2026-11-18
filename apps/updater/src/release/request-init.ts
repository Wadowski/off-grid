// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RELEASE_REQUEST_TIMEOUT_MILLISECONDS } from "../constants.js";

export const requestInit = (headers: Record<string, string>): RequestInit => ({
  headers,
  redirect: "manual",
  signal: AbortSignal.timeout(RELEASE_REQUEST_TIMEOUT_MILLISECONDS),
});
