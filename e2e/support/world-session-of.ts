// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Session } from "./factories/instance-admin.js";
import type { ScenarioWorld } from "./fixtures.js";

export const worldSessionOf = (world: ScenarioWorld, name: string): Session => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person.session;
};
