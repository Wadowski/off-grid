// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { publishUserNotified } from "../../events/publish-user-notified.js";
import type { NotificationInput } from "../../types.js";

export const notifyUser = async (
  tx: ModuleTransaction,
  input: NotificationInput,
  now: Date = new Date(),
): Promise<void> => {
  await publishUserNotified(tx, { id: randomUUID(), userId: input.userId, type: input.type }, now);
};
