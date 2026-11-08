// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingsLink } from "./types.js";

export const SETTINGS_LINKS: readonly SettingsLink[] = [
  {
    path: "/settings/profile",
    labelTextId: "settings.profileLabel",
    descriptionTextId: "settings.profileDescription",
  },
  {
    path: "/settings/password",
    labelTextId: "settings.passwordLabel",
    descriptionTextId: "settings.passwordDescription",
  },
  {
    path: "/settings/devices",
    labelTextId: "settings.devicesLabel",
    descriptionTextId: "settings.devicesDescription",
  },
  {
    path: "/settings/recovery-code",
    labelTextId: "settings.recoveryLabel",
    descriptionTextId: "settings.recoveryDescription",
  },
];
