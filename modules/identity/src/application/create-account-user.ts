// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { uniqueViolationModel } from "../infrastructure/unique-violation-model.js";
import type { CreateUserInput, User } from "../types.js";
import { createUser } from "./create-user.js";
import { EmailTakenError } from "./email-taken-error.js";
import { FirstAdminClaimedError } from "./first-admin-claimed-error.js";

const USER_ACCOUNT_MODEL = "UserAccount";
const FIRST_ADMIN_CLAIM_MODEL = "FirstAdminClaim";

export const createAccountUser = async (
  db: ModuleDatabase,
  input: CreateUserInput,
): Promise<User> => {
  try {
    return await createUser(db, input);
  } catch (error) {
    const model = uniqueViolationModel(error);
    if (model === USER_ACCOUNT_MODEL) {
      throw new EmailTakenError();
    }
    if (model === FIRST_ADMIN_CLAIM_MODEL) {
      throw new FirstAdminClaimedError();
    }
    throw error;
  }
};
