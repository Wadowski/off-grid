// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { accountCreatedSchema } from "./account-created-schema.js";
import { adminUserListSchema } from "./admin-user-list-schema.js";
import { adminUserSchema } from "./admin-user-schema.js";
import { createAccountRequestSchema } from "./create-account-request-schema.js";
import { accessGroupIdSchema } from "./access-group-id-schema.js";
import { accountProfileSchema } from "./account-profile-schema.js";
import { changePasswordRequestSchema } from "./change-password-request-schema.js";
import { passwordConfirmationRequestSchema } from "./password-confirmation-request-schema.js";
import { notificationListSchema } from "./notification-schema.js";
import { recoveryCodeIssuedSchema } from "./recovery-code-issued-schema.js";
import { sessionListSchema } from "./session-list-schema.js";
import { updateProfileRequestSchema } from "./update-profile-request-schema.js";
import { createFamilyRequestSchema } from "./create-family-request-schema.js";
import { errorResponseSchema } from "./error-response-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { familyListSchema } from "./family-list-schema.js";
import { instanceSettingsSchema } from "./instance-settings-schema.js";
import { instanceSettingsUpdateSchema } from "./instance-settings-update-schema.js";
import { familySchema } from "./family-schema.js";
import { passwordResetIssuedSchema } from "./password-reset-issued-schema.js";
import { passwordResetRequestSchema } from "./password-reset-request-schema.js";
import { registrationStatusSchema } from "./registration-status-schema.js";
import { sessionAccessSchema } from "./session-access-schema.js";
import { signInRequestSchema } from "./sign-in-request-schema.js";
import { signedInSchema } from "./signed-in-schema.js";
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
  SignInRequest: signInRequestSchema,
  SignedIn: signedInSchema,
  SessionAccess: sessionAccessSchema,
  AdminUser: adminUserSchema,
  AdminUserList: adminUserListSchema,
  PasswordResetRequest: passwordResetRequestSchema,
  PasswordResetIssued: passwordResetIssuedSchema,
  InstanceSettings: instanceSettingsSchema,
  InstanceSettingsUpdate: instanceSettingsUpdateSchema,
  AccountProfile: accountProfileSchema,
  UpdateProfileRequest: updateProfileRequestSchema,
  ChangePasswordRequest: changePasswordRequestSchema,
  PasswordConfirmationRequest: passwordConfirmationRequestSchema,
  RecoveryCodeIssued: recoveryCodeIssuedSchema,
  SessionList: sessionListSchema,
  NotificationList: notificationListSchema,
} satisfies Record<string, z.ZodType>;
