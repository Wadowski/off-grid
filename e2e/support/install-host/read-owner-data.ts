// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { findFolderAcrossDrives, listDrivesAs } from "../factories/files.js";
import { signInWith } from "../factories/instance-admin.js";
import { FAMILY_NAME, SHOPPING_FOLDER_NAME } from "./constants.js";
import type { InstallOwner } from "./types.js";

export const readOwnerData = async (
  api: APIRequestContext,
  owner: InstallOwner,
): Promise<{ familyDrives: number; shoppingFolderFound: boolean }> => {
  const { session } = await signInWith(api, owner.email, owner.password);
  if (session === undefined) {
    throw new Error("The owner cannot sign in to the installed stack.");
  }
  const drives = await listDrivesAs(api, session);
  const shoppingFolderFound = await findFolderAcrossDrives(
    api,
    session,
    drives,
    SHOPPING_FOLDER_NAME,
  )
    .then(() => true)
    .catch(() => false);
  return {
    familyDrives: drives.filter((drive) => drive.name === FAMILY_NAME).length,
    shoppingFolderFound,
  };
};
