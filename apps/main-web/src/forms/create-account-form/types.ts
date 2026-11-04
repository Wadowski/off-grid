// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type CreateAccountFormProps = {
  readonly onCreated: (recoveryCode: string) => void;
  readonly onRegistrationClosed: () => void;
};

export type CreateAccountStatus = "idle" | "submitting" | "failed";

export type CreateAccountValues = {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly confirmation: string;
};

export type CreateAccountFieldName = keyof CreateAccountValues;

export type CreateAccountErrorTextId =
  | "createAccount.nameRequired"
  | "createAccount.emailInvalid"
  | "createAccount.emailTaken"
  | "createAccount.passwordRequired"
  | "createAccount.passwordTooShort"
  | "createAccount.passwordTooLong"
  | "createAccount.passwordTooCommon"
  | "createAccount.passwordContainsPersonalData"
  | "createAccount.passwordsDoNotMatch";

export type CreateAccountFieldErrors = Record<
  CreateAccountFieldName,
  CreateAccountErrorTextId | undefined
>;

export type RegisterFailure =
  | { readonly kind: "registrationClosed" }
  | { readonly kind: "failed" }
  | {
      readonly kind: "field";
      readonly field: CreateAccountFieldName;
      readonly textId: CreateAccountErrorTextId;
    };

export type PasswordStrengthTextId =
  "createAccount.strength.tooWeak" | "createAccount.strength.strong";

export type CreateAccountLabelTextId =
  | "createAccount.nameLabel"
  | "createAccount.emailLabel"
  | "createAccount.passwordLabel"
  | "createAccount.confirmLabel";
