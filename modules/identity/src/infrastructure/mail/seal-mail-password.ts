// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createCipheriv, randomBytes } from "node:crypto";
import { MAIL_CIPHER_ALGORITHM, MAIL_IV_BYTES, MAIL_TAG_BYTES } from "../../constants.js";

export const sealMailPassword = (encryptionKey: Buffer, password: string): string => {
  const iv = randomBytes(MAIL_IV_BYTES);
  const cipher = createCipheriv(MAIL_CIPHER_ALGORITHM, encryptionKey, iv, {
    authTagLength: MAIL_TAG_BYTES,
  });
  const ciphertext = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
};
