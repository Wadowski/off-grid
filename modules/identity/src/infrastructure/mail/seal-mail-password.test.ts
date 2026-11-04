// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { openMailPassword } from "./open-mail-password.js";
import { sealMailPassword } from "./seal-mail-password.js";

const KEY = Buffer.alloc(32, 7);
const OTHER_KEY = Buffer.alloc(32, 9);
const APP_PASSWORD = "abcdefghijklmnop";

describe("sealMailPassword", () => {
  it("opens back to the original password with the same key", () => {
    const sealed = sealMailPassword(KEY, APP_PASSWORD);

    expect(openMailPassword(KEY, sealed)).toBe(APP_PASSWORD);
  });

  it("does not contain the plaintext password", () => {
    expect(sealMailPassword(KEY, APP_PASSWORD)).not.toContain(APP_PASSWORD);
  });

  it("uses a fresh nonce, so sealing the same password twice gives different values", () => {
    expect(sealMailPassword(KEY, APP_PASSWORD)).not.toBe(sealMailPassword(KEY, APP_PASSWORD));
  });

  it("refuses to open with a different key", () => {
    const sealed = sealMailPassword(KEY, APP_PASSWORD);

    expect(() => openMailPassword(OTHER_KEY, sealed)).toThrow();
  });
});
