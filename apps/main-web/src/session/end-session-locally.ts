// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { clearAccessToken } from "./clear-access-token.js";
import { setSessionState } from "./set-session-state.js";
import type { SignedOutReason } from "./types.js";

export const endSessionLocally = (reason: SignedOutReason | null): void => {
  clearAccessToken();
  setSessionState({ status: "signedOut", freshServer: false, reason });
};
