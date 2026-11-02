// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RESET_CODE_GROUP_SIZE } from "../constants.js";

export const groupResetCode = (characters: string): string =>
  Array.from({ length: characters.length / RESET_CODE_GROUP_SIZE }, (_, index) =>
    characters.slice(index * RESET_CODE_GROUP_SIZE, (index + 1) * RESET_CODE_GROUP_SIZE),
  ).join("-");
