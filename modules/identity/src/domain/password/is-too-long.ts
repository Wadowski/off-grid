// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MAX_LENGTH } from "../../constants.js";

export const isTooLong = (password: string): boolean => [...password].length > PASSWORD_MAX_LENGTH;
