// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InstanceSettingsUpdate, MailSettingsRequest } from "@offgrid/contracts";
import {
  adminRoutes,
  adminUserListSchema,
  instanceSettingsSchema,
  instanceSettingsUpdateSchema,
  mailSettingsSchema,
  passwordResetIssuedSchema,
} from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

const withUserId = (path: string, userId: string): string =>
  path.replace(":userId", encodeURIComponent(userId));

export const createAdminClient = (client: ApiClient) => ({
  users: async () => adminUserListSchema.parse(await client.request("GET", adminRoutes.users)),

  disableUser: async (userId: string): Promise<void> => {
    await client.request("POST", withUserId(adminRoutes.disableUser, userId));
  },

  enableUser: async (userId: string): Promise<void> => {
    await client.request("POST", withUserId(adminRoutes.enableUser, userId));
  },

  startPasswordReset: async (userId: string) =>
    passwordResetIssuedSchema.parse(
      await client.request("POST", withUserId(adminRoutes.resetPassword, userId)),
    ),

  instanceSettings: async () =>
    instanceSettingsSchema.parse(await client.request("GET", adminRoutes.instanceSettings)),

  updateInstanceSettings: async (input: InstanceSettingsUpdate) =>
    instanceSettingsSchema.parse(
      await client.request(
        "PATCH",
        adminRoutes.instanceSettings,
        instanceSettingsUpdateSchema.parse(input),
      ),
    ),

  mailSettings: async () =>
    mailSettingsSchema.parse(await client.request("GET", adminRoutes.mailSettings)),

  saveMailSettings: async (input: MailSettingsRequest) =>
    mailSettingsSchema.parse(await client.request("PUT", adminRoutes.mailSettings, input)),

  sendTestMail: async (input: MailSettingsRequest): Promise<void> => {
    await client.request("POST", adminRoutes.mailTest, input);
  },
});
