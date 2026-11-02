// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../constants.js";

export const isTooShort = (password: string): boolean => [...password].length < PASSWORD_MIN_LENGTH;
