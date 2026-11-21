// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readMissedNotifications } from "../../application/inbox/read-missed-notifications.js";
import { errorTypeName } from "../../infrastructure/realtime/error-type-name.js";
import type { MissedNotifications, NotificationStream } from "../../types.js";

export const readMissedOrReset = async (
  stream: NotificationStream,
  lastNoticeId: string,
): Promise<MissedNotifications> => {
  try {
    return await readMissedNotifications(stream.db, stream.userId, lastNoticeId);
  } catch (error: unknown) {
    stream.logger.error("notification replay read failed", { error: errorTypeName(error) });
    return { kind: "reset" };
  }
};
