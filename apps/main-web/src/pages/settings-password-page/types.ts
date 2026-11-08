// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { PasswordFieldProps } from "../../forms/create-account-form/components/password-field/types.js";

export type PasswordFormValues = {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmation: string;
};

export type PasswordFieldErrorTextId = NonNullable<PasswordFieldProps["errorTextId"]>;

export type PasswordFieldErrors = Partial<
  Record<keyof PasswordFormValues, PasswordFieldErrorTextId>
>;

export type PasswordChangeStatus = "idle" | "saving" | "changed" | "failed";

export type PasswordVisibility = Record<keyof PasswordFormValues, boolean>;
