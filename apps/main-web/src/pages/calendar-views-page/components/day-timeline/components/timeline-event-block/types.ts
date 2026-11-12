// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";

export type TimelineEventBlockProps = {
  readonly event: CalendarViewEvent;
  readonly timeZone: string;
  readonly topPx: number;
  readonly heightPx: number;
  readonly column: number;
  readonly columnCount: number;
};
