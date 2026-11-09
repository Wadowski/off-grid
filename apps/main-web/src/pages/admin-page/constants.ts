// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingsSection } from "../settings-page/types.js";

export const ADMIN_MAIL_SECTION: SettingsSection = {
  labelTextId: "admin.mailSection",
  links: [
    {
      path: "/admin/email",
      labelTextId: "admin.emailLink",
      descriptionTextId: "admin.emailDescription",
      iconName: "mail",
      tone: "soft",
    },
  ],
};
