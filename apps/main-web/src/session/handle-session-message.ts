// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { endSessionIfRefused } from "./end-session-if-refused.js";
import { endSessionLocally } from "./end-session-locally.js";
import { loadProfile } from "./load-profile.js";
import { renewSession } from "./renew-session.js";
import type { SessionMessage } from "./types.js";

export const handleSessionMessage = (message: SessionMessage): void => {
  if (message.type === "signed-out") {
    endSessionLocally(null);
    return;
  }
  renewSession().then(loadProfile).catch(endSessionIfRefused);
};
