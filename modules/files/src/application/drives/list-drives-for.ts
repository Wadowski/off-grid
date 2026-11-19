// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { DriveRecord } from "../../types.js";
import { listDrives } from "../../infrastructure/drives/list-drives.js";
import { readAsUser } from "../read-as-user.js";

export const listDrivesFor = (db: ModuleDatabase, userId: string): Promise<DriveRecord[]> =>
  readAsUser(db, userId, listDrives);
