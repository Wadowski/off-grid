// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { registerSelectActiveFamily } from "./active-family/register-select-active-family.js";
import { registerChangeFamilyMemberRole } from "./register-change-family-member-role.js";
import { registerCreateFamily } from "./register-create-family.js";
import { registerGetFamily } from "./register-get-family.js";
import { registerListFamilies } from "./register-list-families.js";
import { registerListFamilyMembers } from "./register-list-family-members.js";
import { registerRemoveFamilyMember } from "./register-remove-family-member.js";
import { registerCreateFamilyInvitation } from "./invitations/register-create-family-invitation.js";
import { registerPreviewFamilyInvitation } from "./invitations/register-preview-family-invitation.js";
import { registerRedeemFamilyInvitation } from "./invitations/register-redeem-family-invitation.js";
import { registerRevokeFamilyInvitation } from "./invitations/register-revoke-family-invitation.js";
import type { FamilyRouteContext } from "../types.js";

export const registerFamilyRoutes = (api: FastifyInstance, context: FamilyRouteContext): void => {
  registerCreateFamily(api, context);
  registerListFamilies(api, context);
  registerGetFamily(api, context);
  registerListFamilyMembers(api, context);
  registerChangeFamilyMemberRole(api, context);
  registerRemoveFamilyMember(api, context);
  registerSelectActiveFamily(api, context);
  registerCreateFamilyInvitation(api, context);
  registerRevokeFamilyInvitation(api, context);
  registerPreviewFamilyInvitation(api, context);
  registerRedeemFamilyInvitation(api, context);
};
