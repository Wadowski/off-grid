// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const resetRole = async (client: ClientBase): Promise<void> => {
  await client.query("RESET ROLE");
};
