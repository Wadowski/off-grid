// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { clearAccessToken } from "./clear-access-token.js";
import { handleSessionMessage } from "./handle-session-message.js";
import { listenForSessionMessages } from "./listen-for-session-messages.js";
import { loadProfile } from "./load-profile.js";
import { renewSession } from "./renew-session.js";
import { setSessionState } from "./set-session-state.js";

export const establishSession = async (): Promise<void> => {
  listenForSessionMessages(handleSessionMessage);
  try {
    await renewSession();
    await loadProfile();
  } catch {
    clearAccessToken();
    const registration = await anonymousAuthClient.registrationStatus().catch(() => null);
    setSessionState({
      status: "signedOut",
      freshServer: registration?.freshServer ?? false,
      reason: null,
    });
  }
};
