// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { createFamilyDrive } from "../../application/drives/create-family-drive.js";
import { requireEventFamilyId } from "./require-event-family-id.js";

export const familyDriveSubscription = (db: ModuleDatabase) => ({
  name: "files-family-drive-from-family-created",
  event: familyCreatedV1,
  runAs: "files",
  handler: (event: {
    readonly familyId: string | null;
    readonly payload: { readonly name: string };
  }) =>
    db.$transaction((tx) =>
      createFamilyDrive(tx, requireEventFamilyId(event.familyId), event.payload.name),
    ),
});
