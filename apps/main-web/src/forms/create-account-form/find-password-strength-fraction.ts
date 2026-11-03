// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import { countPasswordCharacters } from "./count-password-characters.js";

export const findPasswordStrengthFraction = (password: string): number =>
  Math.min(countPasswordCharacters(password) / PASSWORD_MIN_LENGTH, 1);
