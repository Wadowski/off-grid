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

export type PasswordRecoveryInput = {
  readonly email: string;
  readonly recoveryCode: string;
  readonly password: string;
};

export type PasswordResetInput = {
  readonly email: string;
  readonly code: string;
  readonly password: string;
};

export type EmailCodeInput = {
  readonly email: string;
};
