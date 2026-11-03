// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { adminUserSchema } from "./admin-user-schema.js";

export const adminUserListSchema = z.object({
  users: z.array(adminUserSchema),
});
