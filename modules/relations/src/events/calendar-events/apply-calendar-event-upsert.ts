// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import { LinkableEntityOutOfOrderError } from "../../application/errors/linkable-entity-out-of-order-error.js";
import { findStoredLinkableEntity } from "../../infrastructure/linkable-entities/find-stored-linkable-entity.js";
import { upsertLinkableEntity } from "../../infrastructure/linkable-entities/upsert-linkable-entity.js";
import type { LinkableEntityUpsert } from "../../types.js";

export const applyCalendarEventUpsert = async (
  tx: ModuleTransaction,
  change: LinkableEntityUpsert,
): Promise<void> => {
  const stored = await findStoredLinkableEntity(tx, change.endpoint);
  const decision = classifySourceVersion(stored?.sourceVersion ?? null, change.sourceVersion);
  if (decision === "duplicate" || decision === "stale") {
    return;
  }
  if (decision === "gap") {
    throw new LinkableEntityOutOfOrderError();
  }
  await upsertLinkableEntity(tx, change);
};
