// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { registerChangeFamilyMemberRole } from "./register-change-family-member-role.js";
import { registerCreateFamily } from "./register-create-family.js";
import { registerGetFamily } from "./register-get-family.js";
import { registerListFamilies } from "./register-list-families.js";
import { registerListFamilyMembers } from "./register-list-family-members.js";
import { registerRemoveFamilyMember } from "./register-remove-family-member.js";
import type { FamilyRouteContext } from "../types.js";

export const registerFamilyRoutes = (api: FastifyInstance, context: FamilyRouteContext): void => {
  registerCreateFamily(api, context);
  registerListFamilies(api, context);
  registerGetFamily(api, context);
  registerListFamilyMembers(api, context);
  registerChangeFamilyMemberRole(api, context);
  registerRemoveFamilyMember(api, context);
};
