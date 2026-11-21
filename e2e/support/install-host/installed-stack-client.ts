// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, PlaywrightWorkerArgs } from "@playwright/test";
import { installedServerUrl } from "./installed-server-url.js";

export const installedStackClient = (
  playwright: PlaywrightWorkerArgs["playwright"],
): Promise<APIRequestContext> => playwright.request.newContext({ baseURL: installedServerUrl() });
