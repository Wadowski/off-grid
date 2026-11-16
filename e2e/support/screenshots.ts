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

const SCREEN_TAG = "@screen:";

const UUID_SEGMENT = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi;

export const screenNameFor = (url: string, tags: readonly string[]): string => {
  const screenTag = tags.find((tag) => tag.startsWith(SCREEN_TAG));
  if (screenTag !== undefined) {
    return screenTag.slice(SCREEN_TAG.length);
  }
  return new URL(url).pathname.replace(UUID_SEGMENT, "/:id");
};

export const isScreenUrl = (url: string): boolean => url.startsWith("http");

const screenKey = (feature: string, screen: string): string => `${slug(feature)}/${slug(screen)}`;

const shotName = (name: string, theme: Theme, mobile: boolean): string =>
  [name, theme === "dark" ? "dark" : undefined, mobile ? "mobile" : undefined]
    .filter((part): part is string => part !== undefined)
    .join(" ");

const captured = new Set<string>();

const nextFrame = (page: Page): Promise<void> =>
  page.evaluate("new Promise((resolve) => requestAnimationFrame(() => resolve()))");

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
  await page.waitForFunction("document.documentElement.scrollWidth <= window.innerWidth");
  // A layout change can refetch data (for example the guest list), so wait for the page to settle.
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: screenPath(feature, shotName(name, theme, true)), fullPage: true });
  if (desktopViewport !== null) {
    await page.setViewportSize(desktopViewport);
  }
  return path;
};

export async function captureScreen(
  page: Page,
  name: string,
  feature = "adhoc",
): Promise<string | undefined> {
  if (!screenshotsEnabled()) {
    return undefined;
  }
  const key = screenKey(feature, name);
  const lightPath = screenPath(feature, shotName(name, "light", false));
  if (captured.has(key)) {
    return lightPath;
  }
  captured.add(key);
  await mkdir(screenPath(feature, name).split("/").slice(0, -1).join("/"), { recursive: true });
  const path = await captureTheme(page, name, feature, "light");
  await captureTheme(page, name, feature, "dark");
  await page.emulateMedia({ colorScheme: "light" });
  return path;
}
