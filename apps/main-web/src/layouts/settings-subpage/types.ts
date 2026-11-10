// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { ReactNode } from "react";

export type SettingsSubpageProps = {
  readonly titleTextId: ParseKeys;
  readonly centered?: boolean;
  readonly children: ReactNode;
};
