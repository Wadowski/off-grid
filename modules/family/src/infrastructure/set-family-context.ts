// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const setFamilyContext = async (client: ClientBase, familyId: string): Promise<void> => {
  await client.query("SELECT set_config('app.family_id', $1, true)", [familyId]);
};
