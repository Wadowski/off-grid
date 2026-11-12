// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../../../calendars/types.js";
import type { CurrentUser, FamilySummary } from "../../../../types.js";

export type AppSidebarProps = {
  readonly user: CurrentUser;
  readonly families: readonly FamilySummary[];
  readonly calendars: readonly Calendar[];
  readonly onSignOut: () => void;
};
