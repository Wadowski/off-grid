// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DUMMY_PASSWORD } from "../constants.js";
import { hashPassword } from "./hash-password.js";

let dummyHash: Promise<string> | undefined;

// Sign-in verifies a password even for an unknown email, so both paths take the same time.
export const dummyPasswordHash = (): Promise<string> => {
  dummyHash ??= hashPassword(DUMMY_PASSWORD);
  return dummyHash;
};
