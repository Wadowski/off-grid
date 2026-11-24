// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Locator, Page } from "@playwright/test";

export const tableRows = (page: Page): Locator => page.getByTestId("file-table-row");

export const rowNamed = (page: Page, name: string): Locator =>
  tableRows(page).filter({
    has: page.getByTestId("file-table-name").getByText(name, { exact: true }),
  });

export const rowActivatorNamed = (page: Page, name: string): Locator =>
  rowNamed(page, name).getByTestId("file-table-activate");
