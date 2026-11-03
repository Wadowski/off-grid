// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import type { CreateAccountErrorTextId, RegisterFailure } from "./types.js";

const PASSWORD_ERROR_TEXT_IDS = new Map<string, CreateAccountErrorTextId>([
  ["PASSWORD_TOO_SHORT", "createAccount.passwordTooShort"],
  ["PASSWORD_TOO_LONG", "createAccount.passwordTooLong"],
  ["PASSWORD_TOO_COMMON", "createAccount.passwordTooCommon"],
  ["PASSWORD_CONTAINS_PERSONAL_DATA", "createAccount.passwordContainsPersonalData"],
]);

export const mapRegisterError = (error: unknown): RegisterFailure => {
  if (!(error instanceof ApiError)) {
    return { kind: "failed" };
  }
  if (error.code === "REGISTRATION_CLOSED") {
    return { kind: "registrationClosed" };
  }
  if (error.code === "EMAIL_TAKEN") {
    return { kind: "field", field: "email", textId: "createAccount.emailTaken" };
  }
  const passwordTextId = PASSWORD_ERROR_TEXT_IDS.get(error.code);
  if (passwordTextId !== undefined) {
    return { kind: "field", field: "password", textId: passwordTextId };
  }
  return { kind: "failed" };
};
