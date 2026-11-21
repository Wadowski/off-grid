// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import type { WebAccount } from "../web-session.js";
import { SECTION_HEADING } from "./constants.js";
import { openAdminPage } from "./open-admin-page.js";

export const openSystemUpdateScreen = async (page: Page, account: WebAccount): Promise<void> => {
  await openAdminPage(page, account);
  await expect(page.getByText(SECTION_HEADING, { exact: true })).toBeVisible();
};
