// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb, Drive } from "../../../../../../files/types.js";

export type BreadcrumbItemProps = {
  readonly driveId: Drive["id"];
  readonly crumb: Breadcrumb;
  readonly index: number;
  readonly isCurrent: boolean;
};
