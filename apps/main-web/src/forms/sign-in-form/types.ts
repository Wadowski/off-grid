// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type SignInValues = {
  readonly email: string;
  readonly password: string;
};

export type SignInFieldErrors = {
  readonly email: "signIn.emailInvalid" | undefined;
  readonly password: "signIn.passwordRequired" | undefined;
};

export type SignInStatus = "idle" | "submitting" | "invalidCredentials" | "unreachable" | "failed";

export type SignInFailureTextId =
  "signIn.invalidCredentials" | "signIn.unreachable" | "signIn.failed";

export type SignInFailure =
  | { readonly kind: "invalidCredentials" }
  | { readonly kind: "unreachable" }
  | { readonly kind: "failed" };
