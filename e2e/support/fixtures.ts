// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { test as base } from "playwright-bdd";
import type { Family } from "./factories/family.js";

type ScenarioWorld = {
  api: APIRequestContext;
  healthResponse?: APIResponse;
  families: Family[];
};

export const test = base.extend<{ world: ScenarioWorld }>({
  world: async ({ request }, use) => {
    await use({ api: request, families: [] });
  },
});

export { expect };
