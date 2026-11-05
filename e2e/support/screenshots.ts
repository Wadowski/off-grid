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

type Theme = "light" | "dark";

const nextFrame = (page: Page): Promise<void> =>
  page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

const shotName = (name: string, theme: Theme, mobile: boolean): string =>
  [name, theme === "dark" ? "dark" : undefined, mobile ? "mobile" : undefined]
    .filter((part): part is string => part !== undefined)
    .join(" ");

const captureTheme = async (
  page: Page,
  name: string,
  feature: string,
  theme: Theme,
): Promise<string> => {
  await page.emulateMedia({ colorScheme: theme });
  await nextFrame(page);
  const path = screenPath(feature, shotName(name, theme, false));
  await page.screenshot({ path, fullPage: true });

  const desktopViewport = page.viewportSize();
  await page.setViewportSize(MOBILE_VIEWPORT);
  await nextFrame(page);
  await page.screenshot({ path: screenPath(feature, shotName(name, theme, true)), fullPage: true });
  if (desktopViewport !== null) {
    await page.setViewportSize(desktopViewport);
  }
  return path;
};

/**
 * Saves four full-page screenshots when `E2E_SCREENSHOTS=1`: light and dark theme, each at
 * desktop and 390px mobile width. Light files are `<name>.png` and `<name>-mobile.png`; dark
 * files add `dark` (`<name>-dark.png`, `<name>-dark-mobile.png`). The page is resized and
 * re-themed in place, so the state on screen is kept.
 */
export async function captureScreen(
  page: Page,
  name: string,
  feature = "adhoc",
): Promise<string | undefined> {
  if (!screenshotsEnabled()) {
    return undefined;
  }
  await mkdir(screenPath(feature, name).split("/").slice(0, -1).join("/"), { recursive: true });
  const path = await captureTheme(page, name, feature, "light");
  await captureTheme(page, name, feature, "dark");
  await page.emulateMedia({ colorScheme: "light" });
  return path;
}
