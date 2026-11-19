// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import type { DriveCreatedEventRow, DriveRow } from "./types.js";

export const readAllDrives = async (admin: Client): Promise<DriveRow[]> => {
  const { rows } = await admin.query<DriveRow>(
    "SELECT drive_id, family_id, user_id, kind, name FROM files.drive ORDER BY name",
  );
  return rows;
};

export const readDriveCreatedEvents = async (admin: Client): Promise<DriveCreatedEventRow[]> => {
  const { rows } = await admin.query<DriveCreatedEventRow>(
    "SELECT sequence, payload FROM outbox.event WHERE type = 'drive-created-v1' ORDER BY sequence",
  );
  return rows;
};
