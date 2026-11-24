// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadTransport } from "@offgrid/api-client";
import { endSessionIfRefused } from "./end-session-if-refused.js";
import { getAccessToken } from "./get-access-token.js";
import { renewSession } from "./renew-session.js";
import { sendUploadOnce } from "./send-upload-once.js";

export const sendUploadWithSession: UploadTransport = async (url, init) => {
  const sentToken = getAccessToken();
  const response = await sendUploadOnce(url, init, sentToken);
  if (response.status !== 401 || sentToken === null) {
    return response;
  }
  try {
    if (getAccessToken() === sentToken) {
      await renewSession();
    }
  } catch (error) {
    endSessionIfRefused(error);
    return response;
  }
  return sendUploadOnce(url, init, getAccessToken());
};
