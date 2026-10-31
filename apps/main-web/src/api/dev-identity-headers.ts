// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_DEV_USER_ID, DEV_IDENTITY_USER_HEADER } from "../constants.js";

export const devIdentityHeaders = (): Record<string, string> => {
  if (!import.meta.env.DEV) {
    return {};
  }
  return {
    [DEV_IDENTITY_USER_HEADER]: import.meta.env.VITE_OFFGRID_DEV_USER_ID ?? DEFAULT_DEV_USER_ID,
  };
};
