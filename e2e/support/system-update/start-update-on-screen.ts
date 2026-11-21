// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { CONFIRM_ACTION, CONFIRM_ID, START_BUTTON_ID } from "./constants.js";

export const startUpdateOnScreen = async (page: Page): Promise<void> => {
  await expect(page.getByTestId(START_BUTTON_ID)).toBeEnabled();
  await page.getByTestId(START_BUTTON_ID).click();
  await page.getByTestId(CONFIRM_ID).getByRole("button", { name: CONFIRM_ACTION }).click();
};
