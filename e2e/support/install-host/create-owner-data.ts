// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { createFamilyAs, postAs, waitForDrives } from "../factories/files.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../factories/identity.js";
import { signInWith } from "../factories/instance-admin.js";
import { FAMILY_NAME, OWNER_EMAIL_PREFIX, SHOPPING_FOLDER_NAME } from "./constants.js";
import type { InstallOwner } from "./types.js";

export const createOwnerData = async (api: APIRequestContext): Promise<InstallOwner> => {
  const owner = { email: uniqueEmail(OWNER_EMAIL_PREFIX), password: STRONG_PASSWORD };
  const registration = await registerAccount(api, { email: owner.email });
  if (registration.status !== 201) {
    throw new Error(`The owner account could not be created (${registration.status}).`);
  }
  const { session } = await signInWith(api, owner.email, owner.password);
  if (session === undefined) {
    throw new Error("The owner cannot sign in to the installed stack.");
  }
  await createFamilyAs(api, session, FAMILY_NAME);
  const drives = await waitForDrives(api, session, (list) =>
    list.some((drive) => drive.name === FAMILY_NAME),
  );
  const familyDrive = drives.find((drive) => drive.name === FAMILY_NAME);
  const response = await postAs(api, session, `/api/drives/${familyDrive?.id}/folders`, {
    parentId: null,
    name: SHOPPING_FOLDER_NAME,
  });
  if (response.status !== 201) {
    throw new Error(`The shopping list folder could not be created (${response.status}).`);
  }
  return owner;
};
