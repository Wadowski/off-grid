// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationChannel } from "./notification-channel.js";

// Channels besides the in-app inbox. Email (OG-53) registers here; nothing else does yet.
export const externalNotificationChannels: readonly NotificationChannel[] = [];
