// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewEvent } from "../../../../calendar-views/use-calendar-view.js";

export type AgendaListProps = {
  readonly events: readonly CalendarViewEvent[];
  readonly timeZone: string;
};
