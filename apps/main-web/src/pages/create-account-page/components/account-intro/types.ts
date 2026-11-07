// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type AccountIntroProps = {
  readonly icon: string;
  readonly pillTextId:
    | "createAccount.pill.account"
    | "createAccount.pill.closed"
    | "createAccount.pill.recovery"
    | "firstFamily.pill"
    | "forgotPassword.pill"
    | "resetPassword.pill"
    | "signIn.pill";
  readonly headingTextId:
    | "createAccount.heading"
    | "createAccount.firstRunHeading"
    | "createAccount.closed.heading"
    | "createAccount.recovery.heading"
    | "firstFamily.heading"
    | "forgotPassword.heading"
    | "resetPassword.heading"
    | "signIn.heading";
  readonly bodyTextId:
    | "createAccount.body"
    | "createAccount.firstRunBody"
    | "createAccount.closed.body"
    | "createAccount.recovery.explanation"
    | "firstFamily.body"
    | "forgotPassword.body"
    | "resetPassword.bodyRecoveryCode"
    | "resetPassword.bodyEmailCode"
    | "signIn.welcome";
};
