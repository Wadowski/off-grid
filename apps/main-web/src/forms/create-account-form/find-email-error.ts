// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createAccountRequestSchema } from "@offgrid/contracts";
import type { CreateAccountErrorTextId } from "./types.js";

export const findEmailError = (email: string): CreateAccountErrorTextId | undefined =>
  createAccountRequestSchema.shape.email.safeParse(email.trim()).success
    ? undefined
    : "createAccount.emailInvalid";
