// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const authRoutes = {
  register: "/auth/register",
  registrationStatus: "/auth/registration-status",
  signIn: "/auth/sign-in",
  refresh: "/auth/refresh",
  signOut: "/auth/sign-out",
  passwordReset: "/auth/password-reset",
} as const;

export const adminRoutes = {
  users: "/admin/users",
  disableUser: "/admin/users/:userId/disable",
  enableUser: "/admin/users/:userId/enable",
  resetPassword: "/admin/users/:userId/password-reset",
  instanceSettings: "/admin/instance-settings",
} as const;
