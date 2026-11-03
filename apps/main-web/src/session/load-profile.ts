// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webAuthClient } from "../api/web-api-client.js";
import { getSessionState } from "./get-session-state.js";
import { setSessionState } from "./set-session-state.js";

export const loadProfile = async (): Promise<void> => {
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
