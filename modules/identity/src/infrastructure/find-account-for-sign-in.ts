// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { z } from "zod";
import { ACCOUNT_STATUSES, INSTANCE_ROLES } from "../constants.js";
import type { AccountForSignIn } from "../types.js";
import { setSignInEmail } from "./set-sign-in-email.js";

export const findAccountForSignIn = (
  db: ModuleDatabase,
  email: string,
): Promise<AccountForSignIn | null> =>
  db.$transaction(async (tx) => {
    await setSignInEmail(tx, email);
    const account = await tx.userAccount.findFirst({
      where: { email },
      include: { credential: { select: { passwordHash: true } } },
    });
    if (account === null || account.credential === null) {
      return null;
    }
    return {
      userId: account.userId,
      email: account.email,
      displayName: account.displayName,
      instanceRole: z.enum(INSTANCE_ROLES).parse(account.instanceRole),
      status: z.enum(ACCOUNT_STATUSES).parse(account.status),
      passwordHash: account.credential.passwordHash,
    };
  });
