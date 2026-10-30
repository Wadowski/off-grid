// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AddressInfo } from "node:net";

export const baseUrlOf = (address: AddressInfo | string | null): string => {
  if (address === null || typeof address === "string") {
    throw new Error("server is not listening on a TCP port");
  }
  return `http://${address.address}:${address.port}`;
};
