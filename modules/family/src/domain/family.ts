// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyNameSchema } from "@offgrid/contracts";

export interface Family {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

export function parseFamilyName(input: string): string {
  const parsed = familyNameSchema.safeParse(input.trim());
  if (!parsed.success) {
    throw new InvalidFamilyNameError();
  }
  return parsed.data;
}

export class InvalidFamilyNameError extends Error {
  constructor() {
    super("family name must be 1 to 100 characters");
    this.name = "InvalidFamilyNameError";
  }
}
