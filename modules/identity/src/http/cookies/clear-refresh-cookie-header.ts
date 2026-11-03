// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from "../../constants.js";

export const clearRefreshCookieHeader = (secure: boolean): string =>
  [
    `${REFRESH_COOKIE_NAME}=`,
    `Path=${REFRESH_COOKIE_PATH}`,
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Strict",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
