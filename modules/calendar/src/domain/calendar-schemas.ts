// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { CALENDAR_COLORS } from "./calendar-colors.js";

export const calendarNameSchema = z.string().trim().min(1).max(100);

export const calendarColorSchema = z.enum(CALENDAR_COLORS);
