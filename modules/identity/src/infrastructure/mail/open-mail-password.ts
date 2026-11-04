// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createDecipheriv } from "node:crypto";
import { MAIL_CIPHER_ALGORITHM, MAIL_TAG_BYTES } from "../../constants.js";

const SEALED_PART_COUNT = 3;

export const openMailPassword = (encryptionKey: Buffer, sealed: string): string => {
  const parts = sealed.split(".");
  if (parts.length !== SEALED_PART_COUNT) {
    throw new Error("stored mail password is malformed");
  }
  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));
  if (iv === undefined || tag === undefined || ciphertext === undefined) {
    throw new Error("stored mail password is malformed");
  }
  const decipher = createDecipheriv(MAIL_CIPHER_ALGORITHM, encryptionKey, iv, {
    authTagLength: MAIL_TAG_BYTES,
  });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
};
