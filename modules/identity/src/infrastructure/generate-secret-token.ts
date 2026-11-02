// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";

export const generateSecretToken = (byteLength: number): string =>
  randomBytes(byteLength).toString("base64url");
