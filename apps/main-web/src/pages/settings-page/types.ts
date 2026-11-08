// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";

export type SettingsIconTone = "accent" | "soft" | "good";

export type SettingsLink = {
  readonly path: string;
  readonly labelTextId: ParseKeys;
  readonly descriptionTextId: ParseKeys;
  readonly iconName: string;
  readonly tone: SettingsIconTone;
};

export type SettingsSection = {
  readonly labelTextId: ParseKeys;
  readonly links: readonly SettingsLink[];
};
