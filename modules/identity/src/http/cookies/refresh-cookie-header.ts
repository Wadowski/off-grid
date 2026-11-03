// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from "../../constants.js";

export const refreshCookieHeader = (
  refreshToken: string,
  expiresAt: Date,
  secure: boolean,
): string =>
  [
    `${REFRESH_COOKIE_NAME}=${refreshToken}`,
    `Path=${REFRESH_COOKIE_PATH}`,
    `Expires=${expiresAt.toUTCString()}`,
    "HttpOnly",
    "SameSite=Strict",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
