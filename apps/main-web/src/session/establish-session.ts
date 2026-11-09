// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { clearAccessToken } from "./clear-access-token.js";
import { handleSessionMessage } from "./handle-session-message.js";
import { listenForSessionMessages } from "./listen-for-session-messages.js";
import { loadProfile } from "./load-profile.js";
import { renewSession } from "./renew-session.js";
import { forgetSignedIn, wasSignedIn } from "./signed-in-marker.js";
import { setSessionState } from "./set-session-state.js";
import type { SignedOutReason } from "./types.js";

const SESSION_ENDED_CODE = "SESSION_ENDED";

const endedReasonOf = (error: unknown): SignedOutReason | null => {
  const sessionEnded = error instanceof ApiError && error.code === SESSION_ENDED_CODE;
  if (!sessionEnded || !wasSignedIn()) {
    return null;
  }
  forgetSignedIn();
  return "sessionEnded";
};

export const establishSession = async (): Promise<void> => {
  listenForSessionMessages(handleSessionMessage);
  try {
    await renewSession();
    await loadProfile();
  } catch (error) {
    clearAccessToken();
    const registration = await anonymousAuthClient.registrationStatus().catch(() => null);
    setSessionState({
      status: "signedOut",
      freshServer: registration?.freshServer ?? false,
      reason: endedReasonOf(error),
    });
  }
};
