// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SignInInput } from "@offgrid/api-client";
import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { webAuthClient } from "../api/web-api-client.js";
import { clearAccessToken } from "./access-token.js";
import { endSessionLocally } from "./end-session.js";
import { adoptAccessToken, renewSession } from "./renew-session.js";
import {
  announceSessionMessage,
  listenForSessionMessages,
  type SessionMessage,
} from "./session-channel.js";
import { getSessionState, resetSessionState, setSessionState } from "./session-store.js";

let started: Promise<void> | null = null;

// Runs once per page load. Renews the session from the refresh cookie, or settles on
// the signed-out state, which says whether the server still needs its first account.
export const startSession = (): Promise<void> => {
  started ??= establishSession();
  return started;
};

// Puts the module back to its first-load state. Only tests call this.
export const resetSessionForTests = (): void => {
  started = null;
  clearAccessToken();
  resetSessionState();
};

const establishSession = async (): Promise<void> => {
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

export const signIn = async (input: SignInInput): Promise<void> => {
  adoptAccessToken(await anonymousAuthClient.signIn(input));
  await loadProfile();
  announceSessionMessage({ type: "signed-in" });
};

export const signOut = async (): Promise<void> => {
  try {
    await anonymousAuthClient.signOut();
  } catch {
    // The refresh cookie is cleared by the next sign-in or expires on its own, and the
    // person has chosen to leave, so the local session ends either way.
  }
  endSessionLocally(null);
  announceSessionMessage({ type: "signed-out" });
};

const loadProfile = async (): Promise<void> => {
  const profile = await webAuthClient.profile();
  const previous = getSessionState();
  const previousFamilyId = previous.status === "signedIn" ? previous.activeFamilyId : null;
  const keptFamily = profile.families.some((family) => family.id === previousFamilyId);
  setSessionState({
    status: "signedIn",
    user: {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      instanceRole: profile.instanceRole,
    },
    families: profile.families,
    activeFamilyId: keptFamily ? previousFamilyId : (profile.families[0]?.id ?? null),
  });
};

// Another tab signed in or out. The shared refresh cookie already reflects the change,
// so this tab only needs to renew, or to end its own session in memory.
const handleSessionMessage = (message: SessionMessage): void => {
  if (message.type === "signed-out") {
    endSessionLocally(null);
    return;
  }
  renewSession()
    .then(loadProfile)
    .catch(() => endSessionLocally("sessionEnded"));
};
