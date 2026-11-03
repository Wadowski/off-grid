// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isIP } from "node:net";

export const isIpOrCidr = (value: string): boolean => {
  const [address, prefix, ...rest] = value.split("/");
  if (address === undefined || rest.length > 0) {
    return false;
  }
  const family = isIP(address);
  if (family === 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  return /^\d+$/.test(prefix) && Number(prefix) <= (family === 4 ? 32 : 128);
};
