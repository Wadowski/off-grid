// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { isSameEndpoint } from "../../domain/is-same-endpoint.js";
import { otherEndOf } from "../../domain/other-end-of.js";
import { findCrossEntityLinksOf } from "../../infrastructure/cross-entity-links/find-cross-entity-links-of.js";
import { setLinkContext } from "../../infrastructure/cross-entity-links/set-link-context.js";
import { findVisibleLinkableTitle } from "../../infrastructure/linkable-entities/find-visible-linkable-title.js";
import { findVisibleLinkableTitles } from "../../infrastructure/linkable-entities/find-visible-linkable-titles.js";
import type {
  ActingContext,
  CrossEntityLinkOutcome,
  CrossEntityLinkWithTitle,
  LinkEndpoint,
} from "../../types.js";

export const listCrossEntityLinks = (
  db: ModuleDatabase,
  acting: ActingContext,
  endpoint: LinkEndpoint,
): Promise<CrossEntityLinkOutcome<CrossEntityLinkWithTitle[]>> =>
  db.$transaction(async (tx) => {
    await setLinkContext(tx, acting);
    if ((await findVisibleLinkableTitle(tx, endpoint)) === null) {
      return { outcome: "not-found" };
    }
    const links = await findCrossEntityLinksOf(tx, endpoint);
    const titles = await findVisibleLinkableTitles(
      tx,
      links.map((link) => otherEndOf(link, endpoint)),
    );
    const value = links.flatMap((link): CrossEntityLinkWithTitle[] => {
      const other = otherEndOf(link, endpoint);
      const match = titles.find((title) => isSameEndpoint(title, other));
      return match === undefined ? [] : [{ link, otherEnd: other, title: match.title }];
    });
    return { outcome: "found", value };
  });
