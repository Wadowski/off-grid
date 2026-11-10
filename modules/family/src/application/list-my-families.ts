// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { listFamiliesForUser } from "../infrastructure/list-families-for-user.js";
import type { FamilyListEntry, FamilySummary } from "../types.js";

export const listMyFamilies = async (
  db: ModuleDatabase,
  viewerUserId: string,
): Promise<FamilySummary[]> =>
  (await listMyFamilySpaces(db, viewerUserId)).map(({ id, name }) => ({ id, name }));

export const listMyFamilySpaces = async (
  db: ModuleDatabase,
  viewerUserId: string,
): Promise<FamilyListEntry[]> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, viewerUserId);
    return listFamiliesForUser(tx, viewerUserId);
  });
