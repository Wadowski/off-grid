// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateAccountErrorTextId } from "./types.js";

export const findConfirmationError = (
  password: string,
  confirmation: string,
): CreateAccountErrorTextId | undefined =>
  password === confirmation ? undefined : "createAccount.passwordsDoNotMatch";
