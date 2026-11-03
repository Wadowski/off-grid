// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { canDisableAccount } from "../../domain/accounts/can-disable-account.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { listAccountSnapshots } from "../../infrastructure/accounts/list-account-snapshots.js";
import { lockInstanceSettings } from "../../infrastructure/instance-settings/lock-instance-settings.js";
import { revokeAllSessions } from "../../infrastructure/sessions/revoke-all-sessions.js";
import { setAccountStatus } from "../../infrastructure/accounts/set-account-status.js";
import type { User } from "../../types.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { assertActiveAdmin } from "./assert-active-admin.js";
import { LastAdminError } from "../errors/last-admin-error.js";

export const setUserDisabled = (
  db: ModuleDatabase,
  actorUserId: string,
  targetUserId: string,
  disabled: boolean,
): Promise<User> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    await lockInstanceSettings(tx);
    const target = await findAccount(tx, targetUserId);
    if (target === null) {
      throw new AccountNotFoundError();
    }
    if (disabled && !canDisableAccount(await listAccountSnapshots(tx), targetUserId)) {
      throw new LastAdminError();
    }
    const nextStatus = disabled ? "disabled" : "active";
    await setAccountStatus(tx, targetUserId, nextStatus);
    if (disabled) {
      await revokeAllSessions(tx, targetUserId);
    }
    return { ...target, status: nextStatus };
  });
