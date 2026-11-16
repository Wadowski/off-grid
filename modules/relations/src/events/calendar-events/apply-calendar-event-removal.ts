// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import { LinkableEntityOutOfOrderError } from "../../application/errors/linkable-entity-out-of-order-error.js";
import { deleteCrossEntityLinksOf } from "../../infrastructure/cross-entity-links/delete-cross-entity-links-of.js";
import { deleteGuestsOf } from "../../infrastructure/linkable-entities/delete-guests-of.js";
import { findStoredLinkableEntity } from "../../infrastructure/linkable-entities/find-stored-linkable-entity.js";
import { markLinkableEntityRemoved } from "../../infrastructure/linkable-entities/mark-linkable-entity-removed.js";
import type { LinkableEntityVersion } from "../../types.js";

export const applyCalendarEventRemoval = async (
  tx: ModuleTransaction,
  removal: LinkableEntityVersion,
): Promise<void> => {
  const stored = await findStoredLinkableEntity(tx, removal.endpoint);
  const decision = classifySourceVersion(stored?.sourceVersion ?? null, removal.sourceVersion);
  if (decision === "duplicate" || decision === "stale") {
    return;
  }
  if (decision === "gap") {
    throw new LinkableEntityOutOfOrderError();
  }
  await markLinkableEntityRemoved(tx, removal);
  await deleteGuestsOf(tx, removal.endpoint);
  await deleteCrossEntityLinksOf(tx, removal.endpoint);
};
