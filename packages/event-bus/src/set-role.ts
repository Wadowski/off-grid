// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import { roleOf } from "./role-of.js";

export const setRole = async (client: ClientBase, runAs: string): Promise<void> => {
  await client.query(`SET ROLE ${roleOf(runAs)}`);
};
