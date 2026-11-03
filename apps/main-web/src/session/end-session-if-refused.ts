// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { endSessionLocally } from "./end-session-locally.js";

export const endSessionIfRefused = (error: unknown): void => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    endSessionLocally("sessionEnded");
  }
};
