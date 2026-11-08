// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type ApiClient = {
  readonly request: (
    method: HttpMethod,
    path: string,
    body?: unknown,
    headers?: Readonly<Record<string, string>>,
  ) => Promise<unknown>;
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

export type UpdateProfileInput = {
  readonly displayName: string;
};

export type ChangePasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export type PasswordConfirmationInput = {
  readonly password: string;
};
