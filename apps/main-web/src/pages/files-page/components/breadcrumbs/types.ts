// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb, Drive } from "../../../../files/types.js";

export type BreadcrumbsProps = {
  readonly driveId: Drive["id"];
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly isBusy: boolean;
  readonly phone: boolean;
};
