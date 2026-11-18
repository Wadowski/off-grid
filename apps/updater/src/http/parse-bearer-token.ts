// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BEARER_TOKEN_PATTERN } from "../constants.js";

export const parseBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (authorizationHeader === undefined) {
    return null;
  }
  return BEARER_TOKEN_PATTERN.exec(authorizationHeader)?.[1] ?? null;
};
