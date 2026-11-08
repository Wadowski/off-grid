// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type ForgotPasswordFormProps = {
  readonly emailCodeAvailable: boolean;
};

export type ForgotPasswordStatus = "idle" | "submitting" | "failed" | "emailNotConfigured";

export type ForgotPasswordFailureTextId =
  "forgotPassword.failed" | "forgotPassword.emailNotConfigured";

export type ForgotPasswordEmailTextId = "signIn.emailInvalid";
