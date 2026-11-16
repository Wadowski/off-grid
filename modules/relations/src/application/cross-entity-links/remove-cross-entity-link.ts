// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { deleteCrossEntityLink } from "../../infrastructure/cross-entity-links/delete-cross-entity-link.js";
import { setLinkContext } from "../../infrastructure/cross-entity-links/set-link-context.js";
import type { ActingContext, CrossEntityLinkOutcome } from "../../types.js";

export const removeCrossEntityLink = (
  db: ModuleDatabase,
  acting: ActingContext,
  linkId: string,
): Promise<CrossEntityLinkOutcome<null>> =>
  db.$transaction(async (tx) => {
    await setLinkContext(tx, acting);
    const deleted = await deleteCrossEntityLink(tx, linkId);
    return deleted ? { outcome: "found", value: null } : { outcome: "not-found" };
  });
