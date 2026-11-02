// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { verify } from "@node-rs/argon2";

export const verifyPassword = (passwordHash: string, password: string): Promise<boolean> =>
  verify(passwordHash, password);
