// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Action } from "./types.js";
import { ACCESS_RANK } from "./constants.js";

export const isKnownAction = (action: string): action is Action => {
  return Object.hasOwn(ACCESS_RANK, action);
};
