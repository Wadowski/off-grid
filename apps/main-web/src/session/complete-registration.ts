// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { announceSessionMessage } from "./announce-session-message.js";
import { loadProfile } from "./load-profile.js";
import { renewSession } from "./renew-session.js";

export const completeRegistration = async (): Promise<void> => {
  await renewSession();
  await loadProfile();
  announceSessionMessage({ type: "signed-in" });
};
