// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";

export const provisionLogin = async (
  admin: Client,
  role: string,
  password: string,
): Promise<void> => {
  await admin.query(`ALTER ROLE "${role}" LOGIN PASSWORD ${admin.escapeLiteral(password)}`);
};
