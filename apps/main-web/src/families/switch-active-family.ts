// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webApiClient } from "../api/web-api-client.js";
import { getSessionState } from "../session/get-session-state.js";
import { setSessionState } from "../session/set-session-state.js";

export const setSessionActiveFamilyId = (familyId: string | null): void => {
  const state = getSessionState();
  if (state.status === "signedIn") {
    setSessionState({ ...state, activeFamilyId: familyId });
  }
};

export const switchActiveFamily = async (familyId: string): Promise<void> => {
  await webApiClient.request("PUT", "/families/active", { familyId });
  setSessionActiveFamilyId(familyId);
};
