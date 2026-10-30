// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { IncomingHttpHeaders } from "node:http";
import type { RequestContext } from "./types.js";
import { anonymousContext } from "./anonymous-context.js";
import { readId } from "./read-id.js";
import { ACCESS_GROUPS_HEADER, FAMILY_HEADER, USER_HEADER } from "./constants.js";
import { familyIdSchema, userIdSchema } from "@offgrid/contracts";
import { readIdList } from "./read-id-list.js";

export const resolveRequestContext = (
  headers: IncomingHttpHeaders,
  devIdentity: boolean,
): RequestContext => {
  if (!devIdentity) {
    return anonymousContext();
  }
  return {
    userId: readId(headers, USER_HEADER, userIdSchema),
    familyId: readId(headers, FAMILY_HEADER, familyIdSchema),
    accessGroupIds: readIdList(headers, ACCESS_GROUPS_HEADER),
  };
};
