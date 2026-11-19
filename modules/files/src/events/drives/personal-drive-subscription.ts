// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userCreatedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { createPersonalDrive } from "../../application/drives/create-personal-drive.js";

export const personalDriveSubscription = (db: ModuleDatabase) => ({
  name: "files-personal-drive-from-user-created",
  event: userCreatedV1,
  runAs: "files",
  handler: (event: { readonly payload: { readonly userId: string } }) =>
    db.$transaction((tx) => createPersonalDrive(tx, event.payload.userId)),
});
