// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { nameSchema } from "@offgrid/contracts";
import { z } from "zod";
import { CALENDAR_COLORS } from "./calendar-colors.js";

export const calendarNameSchema = nameSchema;

export const calendarColorSchema = z.enum(CALENDAR_COLORS);
