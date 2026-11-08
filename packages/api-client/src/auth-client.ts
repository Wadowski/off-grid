// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  EmailCodeRequest,
  PasswordRecoveryRequest,
  PasswordResetRequest,
} from "@offgrid/contracts";
import {
  accountCreatedSchema,
  accountProfileSchema,
  accountRoutes,
  authRoutes,
  passwordRecoveryOptionsSchema,
  recoveryCodeIssuedSchema,
  registrationStatusSchema,
  sessionAccessSchema,
  signedInSchema,
} from "@offgrid/contracts";
import { CLIENT_REQUEST_HEADERS } from "./constants.js";
import type { ApiClient, RegisterInput, SignInInput } from "./types.js";

export const createAuthClient = (client: ApiClient) => ({
  registrationStatus: async () =>
    registrationStatusSchema.parse(await client.request("GET", authRoutes.registrationStatus)),

  signIn: async (input: SignInInput) =>
    signedInSchema.parse(await client.request("POST", authRoutes.signIn, input)),

  register: async (input: RegisterInput) =>
    accountCreatedSchema.parse(await client.request("POST", authRoutes.register, input)),

  refresh: async () =>
    sessionAccessSchema.parse(
      await client.request("POST", authRoutes.refresh, undefined, CLIENT_REQUEST_HEADERS),
    ),

  signOut: async (): Promise<void> => {
    await client.request("POST", authRoutes.signOut, undefined, CLIENT_REQUEST_HEADERS);
  },

  passwordRecoveryOptions: async () =>
    passwordRecoveryOptionsSchema.parse(
      await client.request("GET", authRoutes.passwordRecoveryOptions),
    ),

  recoverWithRecoveryCode: async (input: PasswordRecoveryRequest) =>
    recoveryCodeIssuedSchema.parse(
      await client.request("POST", authRoutes.passwordRecovery, input),
    ),

  resetPassword: async (input: PasswordResetRequest) =>
    recoveryCodeIssuedSchema.parse(await client.request("POST", authRoutes.passwordReset, input)),

  requestEmailCode: async (input: EmailCodeRequest): Promise<void> => {
    await client.request("POST", authRoutes.passwordRecoveryEmailCode, input);
  },

  profile: async () => accountProfileSchema.parse(await client.request("GET", accountRoutes.me)),
});
