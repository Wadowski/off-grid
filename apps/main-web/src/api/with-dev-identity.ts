// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { devIdentityHeaders } from "./dev-identity-headers.js";

export const withDevIdentity = (initHeaders?: HeadersInit): Headers => {
  const headers = new Headers(initHeaders);
  for (const [name, value] of Object.entries(devIdentityHeaders())) {
    headers.set(name, value);
  }
  return headers;
};
