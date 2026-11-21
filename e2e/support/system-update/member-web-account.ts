// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ScenarioWorld } from "../fixtures.js";
import type { WebAccount } from "../web-session.js";

export const memberWebAccount = (world: ScenarioWorld): WebAccount => {
  if (world.member === undefined) {
    throw new Error("No regular user has been created in this scenario.");
  }
  return { ...world.member, displayName: "Tom" };
};
