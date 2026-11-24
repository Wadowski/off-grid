// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { signInWith, type Session } from "./factories/instance-admin.js";
import type { ScenarioWorld } from "./fixtures.js";

export const ownSessionOf = async (world: ScenarioWorld): Promise<Session> => {
  if (world.ownAccount === undefined) {
    throw new Error("No web account has been signed in for this scenario.");
  }
  const account = world.ownAccount;
  const signedIn = await signInWith(world.api, account.email, account.password);
  if (signedIn.session === undefined) {
    throw new Error(`${account.displayName} cannot sign in through the API.`);
  }
  return signedIn.session;
};
