// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LinkEndpoint } from "../types.js";

export const isSameEndpoint = (left: LinkEndpoint, right: LinkEndpoint): boolean =>
  left.entityType === right.entityType && left.entityId === right.entityId;
