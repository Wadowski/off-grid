// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CrossEntityLinkRecord } from "../../types.js";

export const toCrossEntityLink = (link: CrossEntityLinkRecord) => ({
  id: link.linkId,
  sourceType: link.source.entityType,
  sourceId: link.source.entityId,
  targetType: link.target.entityType,
  targetId: link.target.entityId,
  createdAt: link.createdAt.toISOString(),
});
