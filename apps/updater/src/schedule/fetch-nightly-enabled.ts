// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes, systemUpdateNightlySchema } from "@offgrid/contracts";
import { NIGHTLY_SETTING_TIMEOUT_MILLISECONDS } from "../constants.js";
import type { HttpFetch } from "../types.js";

export const fetchNightlyEnabled = async (
  serverUrl: string,
  apiToken: string,
  httpFetch: HttpFetch,
): Promise<boolean | undefined> => {
  try {
    const response = await httpFetch(
      new URL(`/api${systemRoutes.updaterNightly}`, serverUrl).toString(),
      {
        method: "GET",
        headers: { authorization: `Bearer ${apiToken}` },
        redirect: "error",
        signal: AbortSignal.timeout(NIGHTLY_SETTING_TIMEOUT_MILLISECONDS),
      },
    );
    if (!response.ok) {
      return undefined;
    }
    return systemUpdateNightlySchema.parse(await response.json()).enabled;
  } catch {
    return undefined;
  }
};
