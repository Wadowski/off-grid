// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../../../calendars/types.js";

export type CalendarRowProps = {
  readonly calendar: Calendar;
  readonly familyName: string | undefined;
};
