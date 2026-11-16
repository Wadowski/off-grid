// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateCrossEntityLinkRequest, LinkableEntityType } from "@offgrid/contracts";
import {
  crossEntityLinkListSchema,
  crossEntityLinkSchema,
  relationsRoutes,
} from "@offgrid/contracts";
import { FAMILY_HEADER } from "./constants.js";
import type { ApiClient } from "./types.js";

const familyHeaders = (familyId?: string): Record<string, string> | undefined =>
  familyId === undefined ? undefined : { [FAMILY_HEADER]: familyId };

const withLinkId = (path: string, id: string): string =>
  path.replace(":id", encodeURIComponent(id));

export const createRelationsClient = (client: ApiClient) => ({
  listCrossEntityLinks: async (
    entityType: LinkableEntityType,
    entityId: string,
    familyId?: string,
  ) =>
    crossEntityLinkListSchema.parse(
      await client.request(
        "GET",
        `${relationsRoutes.crossEntityLinks}?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
        undefined,
        familyHeaders(familyId),
      ),
    ).links,

  createCrossEntityLink: async (input: CreateCrossEntityLinkRequest, familyId?: string) =>
    crossEntityLinkSchema.parse(
      await client.request("POST", relationsRoutes.crossEntityLinks, input, familyHeaders(familyId)),
    ),

  removeCrossEntityLink: async (linkId: string, familyId?: string): Promise<void> => {
    await client.request(
      "DELETE",
      withLinkId(relationsRoutes.crossEntityLink, linkId),
      undefined,
      familyHeaders(familyId),
    );
  },
});
