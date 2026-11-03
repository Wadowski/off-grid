// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomInt } from "node:crypto";
import { RESET_CODE_ALPHABET } from "../../constants.js";

export const randomResetCodeCharacter = (): string =>
  RESET_CODE_ALPHABET.charAt(randomInt(RESET_CODE_ALPHABET.length));
