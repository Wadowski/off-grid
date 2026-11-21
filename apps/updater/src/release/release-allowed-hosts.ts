// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_RELEASE_API_BASE_URL, RELEASE_ALLOWED_HOSTS } from "../constants.js";

export const releaseAllowedHosts = (apiBaseUrl: string): readonly string[] =>
  apiBaseUrl === DEFAULT_RELEASE_API_BASE_URL
    ? RELEASE_ALLOWED_HOSTS
    : [new URL(apiBaseUrl).hostname];
