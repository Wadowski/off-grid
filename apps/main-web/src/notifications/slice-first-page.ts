// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INBOX_PAGE_SIZE } from "./inbox-store/constants.js";

export const sliceFirstPage = <T>(items: readonly T[]): readonly T[] =>
  items.slice(0, INBOX_PAGE_SIZE);
