// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AdminRequiredError } from "../errors/admin-required-error.js";

export const assertInstanceAdmin = async (
  isInstanceAdmin: (userId: string) => Promise<boolean>,
  userId: string,
): Promise<void> => {
  if (!(await isInstanceAdmin(userId))) {
    throw new AdminRequiredError();
  }
};
