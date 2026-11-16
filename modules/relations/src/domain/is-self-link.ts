// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LinkEndpoint } from "../types.js";

export const isSelfLink = (source: LinkEndpoint, target: LinkEndpoint): boolean =>
  source.entityType === target.entityType && source.entityId === target.entityId;
