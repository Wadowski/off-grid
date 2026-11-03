// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { endSessionIfRefused } from "./end-session-if-refused.js";
import { renewState } from "./renew-state.js";
import { storeAccessToken } from "./store-access-token.js";

export const renewSession = (): Promise<void> => {
  renewState.inFlight ??= anonymousAuthClient
    .refresh()
    .then((grant) =>
      storeAccessToken(grant.accessToken, grant.accessExpiresAt, () => {
        renewSession().catch(endSessionIfRefused);
      }),
    )
    .finally(() => {
      renewState.inFlight = null;
    });
  return renewState.inFlight;
};
