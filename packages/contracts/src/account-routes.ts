// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const accountRoutes = {
  me: "/me",
  password: "/me/password",
  recoveryCode: "/me/recovery-code",
  sessions: "/me/sessions",
  session: "/me/sessions/:sessionId",
  otherSessions: "/me/sessions/sign-out-others",
  notifications: "/me/notifications",
  notificationRead: "/me/notifications/:notificationId/read",
} as const;
