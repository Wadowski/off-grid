// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";

export type MonthDayCellProps = {
  readonly date: string;
  readonly inMonth: boolean;
  readonly events: readonly CalendarViewEvent[];
  readonly selected: boolean;
  readonly today: boolean;
  readonly onSelect: (date: string) => void;
};
