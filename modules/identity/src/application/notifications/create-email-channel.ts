// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EmailChannelDependencies, NotificationChannel } from "../../types.js";
import { deliverEmailNotification } from "./deliver-email-notification.js";

export const createEmailChannel = (
  dependencies: EmailChannelDependencies,
): NotificationChannel => ({
  name: "email",
  deliver: (notification) => deliverEmailNotification(dependencies, notification),
});
