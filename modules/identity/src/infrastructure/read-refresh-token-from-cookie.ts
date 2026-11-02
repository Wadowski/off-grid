// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REFRESH_COOKIE_NAME } from "../constants.js";

export const readRefreshTokenFromCookie = (cookieHeader: string | undefined): string | null => {
  if (cookieHeader === undefined) {
    return null;
  }
  for (const part of cookieHeader.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === REFRESH_COOKIE_NAME && value.length > 0) {
      return value.join("=");
    }
  }
  return null;
};
