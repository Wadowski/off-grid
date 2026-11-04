// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createDecipheriv } from "node:crypto";
import { MAIL_CIPHER_ALGORITHM, MAIL_TAG_BYTES } from "../../constants.js";

export const openMailPassword = (encryptionKey: Buffer, sealed: string): string => {
  const [iv, tag, ciphertext] = sealed.split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv(MAIL_CIPHER_ALGORITHM, encryptionKey, iv ?? Buffer.alloc(0), {
    authTagLength: MAIL_TAG_BYTES,
  });
  decipher.setAuthTag(tag ?? Buffer.alloc(0));
  return Buffer.concat([decipher.update(ciphertext ?? Buffer.alloc(0)), decipher.final()]).toString(
    "utf8",
  );
};
