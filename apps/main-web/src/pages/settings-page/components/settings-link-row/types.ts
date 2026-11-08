// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingsLink } from "../../types.js";

export type SettingsLinkRowProps = {
  readonly link: SettingsLink;
  readonly isFirst: boolean;
};
