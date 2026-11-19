// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListedNotification } from "../../types.js";

export const formatNoticeFrame = (notice: ListedNotification): string =>
  `event: notification\nid: ${notice.id}\ndata: ${JSON.stringify(notice)}\n\n`;
