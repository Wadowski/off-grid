// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RFC5987_RESERVED_CHARACTER_PATTERN } from "../../constants.js";

export const encodeRfc5987Value = (value: string): string =>
  encodeURIComponent(value).replace(
    RFC5987_RESERVED_CHARACTER_PATTERN,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
