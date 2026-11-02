// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { verify } from "@node-rs/argon2";
import { describe, expect, it } from "vitest";
import { PASSWORD_HASH_PATTERN } from "../constants.js";
import { hashPassword } from "./hash-password.js";

describe("hashPassword", () => {
  it("produces an Argon2id hash with the OWASP minimum parameters", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).toMatch(PASSWORD_HASH_PATTERN);
    expect(hash).toContain("m=19456,t=2,p=1");
  });

  it("produces a hash that verifies the original password and no other", async () => {
    const hash = await hashPassword("correct horse battery staple");

    await expect(verify(hash, "correct horse battery staple")).resolves.toBe(true);
    await expect(verify(hash, "a different password")).resolves.toBe(false);
  });
});
