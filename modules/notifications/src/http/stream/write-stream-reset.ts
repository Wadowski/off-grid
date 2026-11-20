// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import { STREAM_RESET_COMMENT } from "../../constants.js";

export const writeStreamReset = (response: ServerResponse): void => {
  response.write(STREAM_RESET_COMMENT);
};
