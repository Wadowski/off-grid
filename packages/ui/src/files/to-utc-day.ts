// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarDay } from "./types.js";

export const toUtcDay = ({ year, month, day }: CalendarDay): number =>
  Date.UTC(year, month - 1, day);
