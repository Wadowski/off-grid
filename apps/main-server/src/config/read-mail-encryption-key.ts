// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAIL_ENCRYPTION_KEY_BYTES } from "../constants.js";
import type { ReadSecretFile } from "../types.js";
import { ConfigError } from "./config-error.js";
import { readRequiredSecret } from "./read-required-secret.js";

export const readMailEncryptionKey = (
  secretPath: string,
  readSecretFile: ReadSecretFile,
): Buffer => {
  const encoded = readRequiredSecret(
    "OFFGRID_MAIL_ENCRYPTION_KEY_FILE",
    secretPath,
    readSecretFile,
  );
  const key = Buffer.from(encoded, "base64");
  if (key.length !== MAIL_ENCRYPTION_KEY_BYTES) {
    throw new ConfigError(
      `secret file named by OFFGRID_MAIL_ENCRYPTION_KEY_FILE must hold a base64-encoded ${MAIL_ENCRYPTION_KEY_BYTES}-byte key`,
    );
  }
  return key;
};
