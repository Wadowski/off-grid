// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { announceSessionMessage } from "./announce-session-message.js";
import { endSessionLocally } from "./end-session-locally.js";

export const signOut = async (): Promise<void> => {
  await anonymousAuthClient.signOut().catch(() => undefined);
  endSessionLocally(null);
  announceSessionMessage({ type: "signed-out" });
};
