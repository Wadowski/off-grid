// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { eventually } from "../eventually.js";
import { VERSION_POLL_TIMEOUT_MS } from "./constants.js";
import { readRunningVersion } from "./read-running-version.js";

export const waitForRunningVersion = (api: APIRequestContext, version: string): Promise<string> =>
  eventually(
    async () => {
      const running = await readRunningVersion(api);
      if (running !== version) {
        throw new Error(`The server runs ${running}, not ${version}.`);
      }
      return running;
    },
    { timeout: VERSION_POLL_TIMEOUT_MS, interval: 1_000 },
  );
