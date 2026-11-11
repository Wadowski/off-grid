// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const CALENDAR_COLORS = ["blue", "teal", "green", "amber", "rose", "violet"] as const;

export const calendarColorSchema = z.enum(CALENDAR_COLORS);
