// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TimeZoneSetting } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import { upsertTimeZone } from "../../infrastructure/time-zones/upsert-time-zone.js";

export const getTimeZone = (db: ModuleDatabase, userId: string): Promise<TimeZoneSetting> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const timeZone = await findTimeZone(tx, userId);
    return { timeZone: timeZone ?? DEFAULT_TIME_ZONE, isSet: timeZone !== null };
  });

export const setTimeZone = (
  db: ModuleDatabase,
  userId: string,
  timeZone: string,
): Promise<TimeZoneSetting> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await upsertTimeZone(tx, userId, timeZone);
    return { timeZone, isSet: true };
  });
