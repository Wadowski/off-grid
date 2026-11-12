// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { uuidSchema } from "./uuid-schema.js";

export const calendarEventIdSchema = uuidSchema.brand<"CalendarEventId">();
