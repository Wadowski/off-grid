// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewNotification } from "../../types.js";

// A way to reach a person besides the in-app inbox (for example email). The inbox is
// written inside the change's transaction; channels are delivered after it commits.
export interface NotificationChannel {
  readonly name: string;
  deliver(notification: NewNotification): Promise<void>;
}
