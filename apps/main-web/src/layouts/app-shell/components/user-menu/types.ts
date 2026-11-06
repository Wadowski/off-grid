// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUser } from "../../../../types.js";

export type UserMenuProps = {
  readonly user: CurrentUser;
  readonly onSignOut: () => void;
};
