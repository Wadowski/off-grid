// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { endSessionIfRefused } from "./end-session-if-refused.js";
import { getAccessToken } from "./get-access-token.js";
import { renewSession } from "./renew-session.js";
import { sendOnce } from "./send-once.js";

export const sendWithSession = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const sentToken = getAccessToken();
  const response = await sendOnce(input, init, sentToken);
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
  return sendOnce(input, init, getAccessToken());
};
