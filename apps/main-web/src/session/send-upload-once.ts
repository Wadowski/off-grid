// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendUploadXhr } from "@offgrid/api-client";
import type { UploadTransport } from "@offgrid/api-client";
import { sessionHeaders } from "./session-headers.js";

export const sendUploadOnce = (
  url: string,
  init: Parameters<UploadTransport>[1],
  token: string | null,
): Promise<Response> =>
  sendUploadXhr(url, {
    ...init,
    headers: Object.fromEntries(sessionHeaders(init.headers, token)),
  });
