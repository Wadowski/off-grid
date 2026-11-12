// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type AccountIntroProps = {
  readonly icon: string;
  readonly pillTextId:
    | "createAccount.pill.account"
    | "createAccount.pill.closed"
    | "createAccount.pill.recovery"
    | "firstFamily.pill"
    | "calendar.heading"
    | "forgotPassword.pill"
    | "joinSpace.pill"
    | "resetPassword.pill"
    | "signIn.pill";
  readonly headingTextId:
    | "createAccount.heading"
    | "createAccount.firstRunHeading"
    | "createAccount.closed.heading"
    | "calendar.calendars.editHeading"
    | "calendar.calendars.newHeading"
    | "createAccount.recovery.heading"
    | "firstFamily.heading"
    | "forgotPassword.heading"
    | "joinSpace.heading"
    | "joinSpace.previewHeading"
    | "resetPassword.heading"
    | "signIn.heading";
  readonly bodyTextId?:
    | "calendar.calendars.newBody"
    | "createAccount.body"
    | "createAccount.firstRunBody"
    | "createAccount.closed.body"
    | "createAccount.recovery.explanation"
    | "firstFamily.body"
    | "forgotPassword.body"
    | "joinSpace.body"
    | "joinSpace.previewBody"
    | "resetPassword.bodyRecoveryCode"
    | "resetPassword.bodyEmailCode"
    | "signIn.welcome";
};
