// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REDIRECT_FORWARDED_HEADER_NAMES } from "../constants.js";

export const keepRedirectHeaders = (headers: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(([name]) =>
      (REDIRECT_FORWARDED_HEADER_NAMES as readonly string[]).includes(name.toLowerCase()),
    ),
  );
