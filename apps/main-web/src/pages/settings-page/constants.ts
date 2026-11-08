// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingsSection } from "./types.js";

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    labelTextId: "settings.accountSection",
    links: [
      {
        path: "/settings/profile",
        labelTextId: "settings.profileLabel",
        descriptionTextId: "settings.profileDescription",
        iconName: "badge",
        tone: "accent",
      },
      {
        path: "/settings/password",
        labelTextId: "settings.passwordLabel",
        descriptionTextId: "settings.passwordDescription",
        iconName: "key",
        tone: "soft",
      },
    ],
  },
  {
    labelTextId: "settings.securitySection",
    links: [
      {
        path: "/settings/devices",
        labelTextId: "settings.devicesLabel",
        descriptionTextId: "settings.devicesDescription",
        iconName: "devices",
        tone: "accent",
      },
      {
        path: "/settings/recovery-code",
        labelTextId: "settings.recoveryLabel",
        descriptionTextId: "settings.recoveryDescription",
        iconName: "vpn_key",
        tone: "good",
      },
    ],
  },
];
