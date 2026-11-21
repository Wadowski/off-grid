// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Page } from "@playwright/test";
import { signInThroughUi, type WebAccount } from "../web-session.js";
import { webBaseUrl } from "../stack.js";
import { ADMIN_PATH } from "./constants.js";

export const openAdminPage = async (page: Page, account: WebAccount): Promise<void> => {
  await signInThroughUi(page, account);
  await page.goto(`${webBaseUrl()}${ADMIN_PATH}`);
};
