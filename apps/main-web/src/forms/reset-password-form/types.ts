// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateAccountErrorTextId } from "../create-account-form/types.js";
import type { RecoveryMethod } from "../../recovery/types.js";

export type ResetPasswordFormProps = {
  readonly email: string;
  readonly method: RecoveryMethod;
  readonly onRecovered: (recoveryCode: string) => void;
};

export type ResetPasswordValues = {
  readonly code: string;
  readonly password: string;
  readonly confirmation: string;
};

export type ResetCodeErrorTextId = "resetPassword.codeRequired" | "resetPassword.codeInvalid";

export type ResetPasswordFieldErrors = {
  readonly code: ResetCodeErrorTextId | undefined;
  readonly password: CreateAccountErrorTextId | undefined;
  readonly confirmation: CreateAccountErrorTextId | undefined;
};

export type ResetPasswordStatus = "idle" | "submitting" | "locked" | "failed";

export type ResetFailure =
  | { readonly kind: "codeInvalid" }
  | { readonly kind: "locked" }
  | { readonly kind: "failed" }
  | { readonly kind: "password"; readonly textId: CreateAccountErrorTextId };
