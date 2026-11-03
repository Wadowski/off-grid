// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SignInInput } from "@offgrid/api-client";
import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { announceSessionMessage } from "./announce-session-message.js";
import { clearAccessToken } from "./clear-access-token.js";
import { endSessionIfRefused } from "./end-session-if-refused.js";
import { loadProfile } from "./load-profile.js";
import { renewSession } from "./renew-session.js";
import { storeAccessToken } from "./store-access-token.js";

export const signIn = async (input: SignInInput): Promise<void> => {
  const signedIn = await anonymousAuthClient.signIn(input);
  storeAccessToken(signedIn.accessToken, signedIn.accessExpiresAt, () => {
    renewSession().catch(endSessionIfRefused);
  });
  try {
    await loadProfile();
  } catch (error) {
    clearAccessToken();
    throw error;
  }
  announceSessionMessage({ type: "signed-in" });
};
