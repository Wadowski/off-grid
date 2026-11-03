// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { endSessionIfRefused } from "./end-session-if-refused.js";
import { sessionRuntime } from "./session-runtime.js";
import { storeAccessToken } from "./store-access-token.js";

export const renewSession = (): Promise<void> => {
  sessionRuntime.renewInFlight ??= anonymousAuthClient
    .refresh()
    .then((grant) =>
      storeAccessToken(grant.accessToken, grant.accessExpiresAt, () => {
        renewSession().catch(endSessionIfRefused);
      }),
    )
    .finally(() => {
      sessionRuntime.renewInFlight = null;
    });
  return sessionRuntime.renewInFlight;
};
