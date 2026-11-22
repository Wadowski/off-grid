// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { INBOX_PAGE_SIZE } from "./inbox-store/constants.js";
import { sliceFirstPage } from "./slice-first-page.js";

const itemsOf = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

describe("sliceFirstPage", () => {
  it("keeps every item when there are fewer than one page", () => {
    expect(sliceFirstPage(itemsOf(INBOX_PAGE_SIZE - 1))).toHaveLength(INBOX_PAGE_SIZE - 1);
  });

  it("keeps exactly one page when the items fill it", () => {
    expect(sliceFirstPage(itemsOf(INBOX_PAGE_SIZE))).toHaveLength(INBOX_PAGE_SIZE);
  });

  it("drops the items after the first page", () => {
    const page = sliceFirstPage(itemsOf(INBOX_PAGE_SIZE + 5));

    expect(page).toHaveLength(INBOX_PAGE_SIZE);
    expect(page[INBOX_PAGE_SIZE - 1]).toBe(INBOX_PAGE_SIZE - 1);
  });
});
