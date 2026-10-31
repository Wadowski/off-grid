// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary, ListStatus } from "../../types.js";

export type FamilyListProps = {
  readonly families: readonly FamilySummary[];
  readonly listStatus: ListStatus;
};
