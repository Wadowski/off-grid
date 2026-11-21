// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { createFamilyAs } from "../factories/files.js";
import type { Session } from "../factories/instance-admin.js";

const MEMBER_FAMILY_NAME = "Home";

export const giveMemberAFamily = async (
  api: APIRequestContext,
  session: Session,
): Promise<void> => {
  await createFamilyAs(api, session, MEMBER_FAMILY_NAME);
};
