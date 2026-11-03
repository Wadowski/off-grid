// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateAccountErrorTextId } from "./types.js";

export const findNameError = (displayName: string): CreateAccountErrorTextId | undefined =>
  displayName.trim().length === 0 ? "createAccount.nameRequired" : undefined;
