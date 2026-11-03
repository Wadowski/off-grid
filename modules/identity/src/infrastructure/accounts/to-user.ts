// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { ACCOUNT_STATUSES, INSTANCE_ROLES } from "../../constants.js";
import type { User, UserRecord } from "../../types.js";

export const toUser = (record: UserRecord): User => ({
  id: record.userId,
  email: record.email,
  displayName: record.displayName,
  instanceRole: z.enum(INSTANCE_ROLES).parse(record.instanceRole),
  status: z.enum(ACCOUNT_STATUSES).parse(record.status),
  createdAt: record.createdAt.toISOString(),
});
