// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ScenarioWorld } from "./fixtures.js";

export const worldFamilyNamed = (
  world: ScenarioWorld,
  name: string,
): { id: string; name: string } => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family ${name} does not exist`);
  }
  return family;
};
