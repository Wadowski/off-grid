// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createAccountRequestSchema } from "@offgrid/contracts";

export const isValidEmail = (email: string): boolean =>
  createAccountRequestSchema.shape.email.safeParse(email).success;
