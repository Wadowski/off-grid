// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { timingSafeEqual } from "node:crypto";
import { parseBearerToken } from "./parse-bearer-token.js";
import { sha256Digest } from "./sha256-digest.js";

export const matchesBearerToken = (
  expectedToken: string,
  authorizationHeader: string | undefined,
): boolean => {
  const presentedToken = parseBearerToken(authorizationHeader);
  return (
    presentedToken !== null &&
    timingSafeEqual(sha256Digest(expectedToken), sha256Digest(presentedToken))
  );
};
