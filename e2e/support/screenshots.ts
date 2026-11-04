// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const DEFAULT_DIR = fileURLToPath(new URL("../artifacts/screens", import.meta.url));

export const screenshotsEnabled = (): boolean => process.env.E2E_SCREENSHOTS === "1";

export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "screen";

export const screenPath = (feature: string, name: string): string =>
  `${process.env.E2E_SCREENSHOTS_DIR ?? DEFAULT_DIR}/${slug(feature)}/${slug(name)}.png`;

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const nextFrame = (page: Page): Promise<void> =>
  page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

/**
 * Saves a full-page desktop screenshot and a 390px mobile one (`<name>-mobile.png`) when
 * `E2E_SCREENSHOTS=1`. The mobile shot resizes the same page, so the state on screen is kept.
 */
export async function captureScreen(
  page: Page,
  name: string,
  feature = "adhoc",
): Promise<string | undefined> {
  if (!screenshotsEnabled()) {
    return undefined;
  }
  const path = screenPath(feature, name);
  await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await page.screenshot({ path, fullPage: true });

  const desktopViewport = page.viewportSize();
  await page.setViewportSize(MOBILE_VIEWPORT);
  await nextFrame(page);
  await page.screenshot({ path: screenPath(feature, `${name} mobile`), fullPage: true });
  if (desktopViewport !== null) {
    await page.setViewportSize(desktopViewport);
  }
  return path;
}
