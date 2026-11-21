// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { CHECK_BUTTON_ID } from "./constants.js";
import { updateSection } from "./update-section.js";

export const checkForUpdatesOnScreen = async (page: Page, latestVersion: string): Promise<void> => {
  await page.getByTestId(CHECK_BUTTON_ID).click();
  await expect(updateSection(page)).toContainText(latestVersion);
};
