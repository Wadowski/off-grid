// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadTransport } from "@offgrid/api-client";
import { retryAfterRenewal } from "./retry-after-renewal.js";
import { sendUploadOnce } from "./send-upload-once.js";

export const sendUploadWithSession: UploadTransport = (url, init) =>
  retryAfterRenewal((token) => sendUploadOnce(url, init, token));
