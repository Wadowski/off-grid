// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RESET_CODE_LENGTH } from "../constants.js";
import { groupResetCode } from "./group-reset-code.js";
import { randomResetCodeCharacter } from "./random-reset-code-character.js";

export const generateResetCode = (): string =>
  groupResetCode(Array.from({ length: RESET_CODE_LENGTH }, randomResetCodeCharacter).join(""));
