// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isAllowedHttpsUrl = (url: string, allowedHosts: readonly string[]): boolean => {
  const parsed = URL.parse(url);
  return parsed !== null && parsed.protocol === "https:" && allowedHosts.includes(parsed.hostname);
};
