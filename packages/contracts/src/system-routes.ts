// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const systemRoutes = {
  version: "/system/version",
  update: "/system/update",
  updateCheck: "/system/update/check",
  updateApply: "/system/update/apply",
  updateNightly: "/system/update/nightly",
} as const;
