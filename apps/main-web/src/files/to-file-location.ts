// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb } from "./types.js";

export const toFileLocation = (breadcrumbs: readonly Breadcrumb[]): readonly string[] =>
  breadcrumbs.slice(0, -1).map((crumb) => crumb.name);
