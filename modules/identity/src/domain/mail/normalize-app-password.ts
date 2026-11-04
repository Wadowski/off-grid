// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailProvider } from "@offgrid/contracts";

export const normalizeAppPassword = (provider: MailProvider, password: string): string => {
  const withoutSpaces = password.replace(/\s+/g, "");
  return provider === "icloud" ? withoutSpaces.replace(/-/g, "") : withoutSpaces;
};
