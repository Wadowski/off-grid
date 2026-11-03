// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ErrorBody } from "../../types.js";
import { INTERNAL_MESSAGE } from "../../constants.js";
import { codeFor } from "./code-for.js";
import { messageFor } from "./message-for.js";

export const errorBodyFor = (error: unknown, status: number): ErrorBody => {
  if (status >= 500) {
    return { code: "INTERNAL_ERROR", message: INTERNAL_MESSAGE };
  }
  return {
    code: codeFor(error, status),
    message: messageFor(error),
  };
};
