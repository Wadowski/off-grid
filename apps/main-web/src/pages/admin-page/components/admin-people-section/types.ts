// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AdminUser } from "@offgrid/contracts";

export type AdminPeopleSectionProps = {
  readonly users: readonly AdminUser[];
  readonly onChanged: () => void;
};
