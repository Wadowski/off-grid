// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NIGHTLY_SETTING_UNREADABLE_MESSAGE } from "../constants.js";
import type { HttpFetch } from "../types.js";
import { fetchNightlyEnabled } from "./fetch-nightly-enabled.js";

export const readNightlySetting = async (
  serverUrl: string,
  apiToken: string,
  httpFetch: HttpFetch,
): Promise<boolean> => {
  const enabled = await fetchNightlyEnabled(serverUrl, apiToken, httpFetch);
  if (enabled === undefined) {
    throw new Error(NIGHTLY_SETTING_UNREADABLE_MESSAGE);
  }
  return enabled;
};
