// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { PASSWORD_ERROR_TEXT_IDS } from "../../constants.js";
import type { RegisterFailure } from "./types.js";

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
