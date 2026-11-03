// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createUserInputSchema } from "./create-user-input-schema.js";

const valid = {
  email: "ada@example.com",
  displayName: "Ada",
  passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA",
  recoveryCodeHash: "code-hash",
};

describe("createUserInputSchema", () => {
  it("accepts a complete account with an argon2id password hash", () => {
    expect(createUserInputSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a password that is not stored as an argon2id hash", () => {
    expect(createUserInputSchema.safeParse({ ...valid, passwordHash: "hunter2" }).success).toBe(
      false,
    );
  });

  it("refuses a blank display name", () => {
    expect(createUserInputSchema.safeParse({ ...valid, displayName: "   " }).success).toBe(false);
  });
});
