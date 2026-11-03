// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  accountCreatedSchema,
  accountProfileSchema,
  accountRoutes,
  authRoutes,
  registrationStatusSchema,
  sessionAccessSchema,
  signedInSchema,
} from "@offgrid/contracts";
import type { ApiClient } from "./create-api-client.js";

// The server refuses refresh and sign-out unless this header is sent, because a
// cross-site form cannot set it. See ADR 0016, "Sessions".
export const CLIENT_REQUEST_HEADERS: Readonly<Record<string, string>> = {
  "x-offgrid-request": "1",
};

export type SignInInput = {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceLabel?: string;
};

export type RegisterInput = {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
};

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

  profile: async () => accountProfileSchema.parse(await client.request("GET", accountRoutes.me)),
});

export type AuthClient = ReturnType<typeof createAuthClient>;
