// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { HEALTH_REQUEST_TIMEOUT_MILLISECONDS } from "../constants.js";

export const probeHealthUrl = async (fetchResponse: typeof fetch, url: string): Promise<boolean> => {
  try {
    const response = await fetchResponse(url, {
      signal: AbortSignal.timeout(HEALTH_REQUEST_TIMEOUT_MILLISECONDS),
    });
    await response.body?.cancel();
    return response.ok;
  } catch {
    return false;
  }
};
