// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Fetcher, UpdaterSettings, UpdaterStatusReply } from "../../types.js";
import { callUpdater } from "./call-updater.js";
import { updaterStatusReplySchema } from "./updater-reply-schemas.js";

export const readUpdaterStatus = (
  settings: UpdaterSettings | null,
  fetcher: Fetcher,
): Promise<UpdaterStatusReply> =>
  callUpdater(settings, fetcher, { method: "GET", path: "/status" }, updaterStatusReplySchema);
