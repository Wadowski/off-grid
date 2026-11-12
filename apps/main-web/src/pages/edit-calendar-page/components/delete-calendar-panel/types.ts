// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarErrorTextId } from "../../../../calendars/to-calendar-error-text-id.js";

export type DeleteCalendarPanelProps = {
  readonly deleting: boolean;
  readonly errorTextId: CalendarErrorTextId | undefined;
  readonly onConfirm: () => void;
};
