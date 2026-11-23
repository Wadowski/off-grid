// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";

const PAGE_MARKER = "__ogNoticesPageMarker";
const PAGE_MARKER_VALUE = "kept";
const NOTICE_APPEAR_TIMEOUT_MS = 15_000;

export const markPageLoadedOnce = async (page: Page): Promise<void> => {
  await page.evaluate(
    ({ key, value }) => {
      Object.assign(globalThis, { [key]: value });
    },
    { key: PAGE_MARKER, value: PAGE_MARKER_VALUE },
  );
};

export const expectNoticeOnOpenPage = async (page: Page, title: string): Promise<void> => {
  await expect(
    page.getByTestId("notification-card").filter({ hasText: title }).first(),
  ).toBeVisible({ timeout: NOTICE_APPEAR_TIMEOUT_MS });
  const marker = await page.evaluate((key) => Reflect.get(globalThis, key), PAGE_MARKER);
  expect(marker, "the page was reloaded").toBe(PAGE_MARKER_VALUE);
};
