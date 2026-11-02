// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const authRoutes = {
  register: "/auth/register",
  registrationStatus: "/auth/registration-status",
  signIn: "/auth/sign-in",
  refresh: "/auth/refresh",
  signOut: "/auth/sign-out",
} as const;
