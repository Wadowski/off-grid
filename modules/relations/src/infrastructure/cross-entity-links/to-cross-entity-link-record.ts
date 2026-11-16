// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { linkableEntityTypeSchema } from "@offgrid/contracts";
import type { CrossEntityLinkRecord, CrossEntityLinkRow } from "../../types.js";

export const toCrossEntityLinkRecord = (row: CrossEntityLinkRow): CrossEntityLinkRecord => ({
  linkId: row.linkId,
  source: { entityType: linkableEntityTypeSchema.parse(row.sourceType), entityId: row.sourceId },
  target: { entityType: linkableEntityTypeSchema.parse(row.targetType), entityId: row.targetId },
  createdAt: row.createdAt,
});
