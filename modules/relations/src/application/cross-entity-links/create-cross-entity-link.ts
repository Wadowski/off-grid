// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import { isSelfLink } from "../../domain/is-self-link.js";
import { ownerOf } from "../../domain/link-owner.js";
import { findCrossEntityLinkByPair } from "../../infrastructure/cross-entity-links/find-cross-entity-link-by-pair.js";
import { insertCrossEntityLink } from "../../infrastructure/cross-entity-links/insert-cross-entity-link.js";
import { setLinkContext } from "../../infrastructure/cross-entity-links/set-link-context.js";
import { findVisibleLinkableTitle } from "../../infrastructure/linkable-entities/find-visible-linkable-title.js";
import type { ActingContext, CreateCrossEntityLinkOutcome, LinkEndpoint } from "../../types.js";

export const createCrossEntityLink = (
  db: ModuleDatabase,
  acting: ActingContext,
  source: LinkEndpoint,
  target: LinkEndpoint,
): Promise<CreateCrossEntityLinkOutcome> => {
  if (isSelfLink(source, target)) {
    return Promise.resolve({ outcome: "self-link" });
  }
  return db.$transaction(async (tx) => {
    await setLinkContext(tx, acting);
    const sourceTitle = await findVisibleLinkableTitle(tx, source);
    const targetTitle = await findVisibleLinkableTitle(tx, target);
    if (sourceTitle === null || targetTitle === null) {
      return { outcome: "not-found" };
    }
    const linkId = randomUUID();
    const inserted = await insertCrossEntityLink(tx, {
      linkId,
      source,
      target,
      owner: ownerOf(acting),
      createdBy: acting.userId,
    });
    if (inserted) {
      const created = await findCrossEntityLinkByPair(tx, source, target);
      return created === null ? { outcome: "not-found" } : { outcome: "created", value: created };
    }
    const existing = await findCrossEntityLinkByPair(tx, source, target);
    return existing === null ? { outcome: "conflict" } : { outcome: "existing", value: existing };
  });
};
