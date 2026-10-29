// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

const uuid = z.uuid();

export interface SettingExecutor {
  $executeRawUnsafe(query: string, ...values: unknown[]): PromiseLike<unknown>;
}

export async function withFamilyContext(tx: SettingExecutor, familyId: string): Promise<void> {
  await tx.$executeRawUnsafe("SELECT set_config('app.family_id', $1, true)", uuid.parse(familyId));
}

export async function withUserContext(tx: SettingExecutor, userId: string): Promise<void> {
  await tx.$executeRawUnsafe("SELECT set_config('app.user_id', $1, true)", uuid.parse(userId));
}
