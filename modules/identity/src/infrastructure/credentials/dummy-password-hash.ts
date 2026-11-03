// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DUMMY_PASSWORD } from "../../constants.js";
import { hashPassword } from "./hash-password.js";

let dummyHash: Promise<string> | undefined;

export const dummyPasswordHash = (): Promise<string> => {
  dummyHash ??= hashPassword(DUMMY_PASSWORD).catch((error: unknown) => {
    dummyHash = undefined;
    throw error;
  });
  return dummyHash;
};
