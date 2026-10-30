// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { test as base } from "playwright-bdd";

type ScenarioWorld = {
  api: APIRequestContext;
  healthResponse?: APIResponse;
};

export const test = base.extend<{ world: ScenarioWorld }>({
  world: async ({ request }, use) => {
    await use({ api: request });
  },
});

export { expect };
