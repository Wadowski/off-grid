// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { clearAccessToken } from "./access-token.js";
import { setSessionState, type SignedOutReason } from "./session-store.js";

// Ends the session in this tab only. The server side is handled by the caller:
// a sign-out has already revoked the session row, and a renewal that was refused
// means the server no longer holds a session to revoke.
export const endSessionLocally = (reason: SignedOutReason | null): void => {
  clearAccessToken();
  setSessionState({ status: "signedOut", freshServer: false, reason });
};
