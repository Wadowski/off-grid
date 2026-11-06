// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomInt } from "node:crypto";
import { EMAIL_CODE_LENGTH } from "../../constants.js";

export const generateEmailCode = (): string =>
  Array.from({ length: EMAIL_CODE_LENGTH }, () => randomInt(0, 10)).join("");
