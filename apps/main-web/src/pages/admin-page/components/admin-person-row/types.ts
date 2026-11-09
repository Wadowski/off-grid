// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AdminUser } from "@offgrid/contracts";
import type { IssuedResetCode } from "../../types.js";

export type AdminPersonRowProps = {
  readonly user: AdminUser;
  readonly isFirst: boolean;
  readonly isLastActiveAdmin: boolean;
  readonly onChanged: () => void;
  readonly onResetCode: (issued: IssuedResetCode) => void;
};
