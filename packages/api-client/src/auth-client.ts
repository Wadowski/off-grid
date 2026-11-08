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
  sessionListSchema,
  signedInSchema,
} from "@offgrid/contracts";
import { CLIENT_REQUEST_HEADERS } from "./constants.js";
import type {
  ApiClient,
  ChangePasswordInput,
  PasswordConfirmationInput,
  RegisterInput,
  SignInInput,
  UpdateProfileInput,
} from "./types.js";

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

  updateProfile: async (input: UpdateProfileInput): Promise<void> => {
    await client.request("PATCH", accountRoutes.me, input);
  },

  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    await client.request("POST", accountRoutes.password, input);
  },

  sessions: async () =>
    sessionListSchema.parse(await client.request("GET", accountRoutes.sessions)),

  endSession: async (sessionId: string): Promise<void> => {
    await client.request("DELETE", accountRoutes.session.replace(":sessionId", sessionId));
  },

  signOutOtherSessions: async (): Promise<void> => {
    await client.request("POST", accountRoutes.otherSessions);
  },

  regenerateRecoveryCode: async (input: PasswordConfirmationInput) =>
    recoveryCodeIssuedSchema.parse(await client.request("POST", accountRoutes.recoveryCode, input)),
});
