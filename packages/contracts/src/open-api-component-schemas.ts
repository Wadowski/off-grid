// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { accountCreatedSchema } from "./account-created-schema.js";
import { createAccountRequestSchema } from "./create-account-request-schema.js";
import { accessGroupIdSchema } from "./access-group-id-schema.js";
import { createFamilyRequestSchema } from "./create-family-request-schema.js";
import { errorResponseSchema } from "./error-response-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { familyListSchema } from "./family-list-schema.js";
import { familySchema } from "./family-schema.js";
import { registrationStatusSchema } from "./registration-status-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const openApiComponentSchemas = {
  FamilyId: familyIdSchema,
  UserId: userIdSchema,
  AccessGroupId: accessGroupIdSchema,
  Timestamp: timestampSchema,
  ErrorResponse: errorResponseSchema,
  CreateFamilyRequest: createFamilyRequestSchema,
  Family: familySchema,
  FamilyList: familyListSchema,
  CreateAccountRequest: createAccountRequestSchema,
  AccountCreated: accountCreatedSchema,
  RegistrationStatus: registrationStatusSchema,
} satisfies Record<string, z.ZodType>;
