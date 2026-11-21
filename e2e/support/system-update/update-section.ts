// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Locator, Page } from "@playwright/test";
import { SECTION_HEADING } from "./constants.js";

export const updateSection = (page: Page): Locator =>
  page.locator("section", { has: page.getByText(SECTION_HEADING, { exact: true }) });
