// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RegistrationState =
  | { readonly status: "loading" }
  | {
      readonly status: "ready";
      readonly freshServer: boolean;
      readonly registrationOpen: boolean;
    };

export type CreateAccountStep =
  | { readonly kind: "form" }
  | { readonly kind: "recovery"; readonly recoveryCode: string }
  | { readonly kind: "closed" };

export type RecoveryContinueStatus = "idle" | "submitting" | "failed";
