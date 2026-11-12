// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { Calendar } from "../../../../calendars/types.js";

export type CalendarSidebarProps = {
  readonly calendars: readonly Calendar[];
  // Slot for controls placed above the calendar list, such as a future "New event" button.
  readonly children?: ReactNode;
};
