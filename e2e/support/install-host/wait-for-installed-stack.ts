// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { eventually } from "../eventually.js";

export const waitForInstalledStack = (api: APIRequestContext): Promise<void> =>
  eventually(
    async () => {
      const response = await api.get("/api/health/ready");
      if (!response.ok()) {
        throw new Error(`The installed stack answers ${response.status()}.`);
      }
    },
    { timeout: 120_000, interval: 1_000 },
  );
