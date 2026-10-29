// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

const uuid = z.uuid();

/** The part of a Prisma transaction client that sets per-transaction settings. */
export interface SettingExecutor {
  $executeRawUnsafe(query: string, ...values: unknown[]): PromiseLike<unknown>;
}

/**
 * Sets the family the transaction acts for. RLS policies read it with
 * `current_setting('app.family_id')`. `SET LOCAL` semantics: the value ends
 * with the transaction, so it cannot leak into the next request on a pooled
 * connection.
 */
export async function withFamilyContext(tx: SettingExecutor, familyId: string): Promise<void> {
  await tx.$executeRawUnsafe("SELECT set_config('app.family_id', $1, true)", uuid.parse(familyId));
}

/** Sets the user the transaction acts for (`app.user_id`), with the same semantics. */
export async function withUserContext(tx: SettingExecutor, userId: string): Promise<void> {
  await tx.$executeRawUnsafe("SELECT set_config('app.user_id', $1, true)", uuid.parse(userId));
}
