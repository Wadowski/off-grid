// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ScenarioWorld } from "./fixtures.js";

// Returns the id of a calendar that the current scenario created, by the name the feature uses for it.
export const calendarIdOf = (world: ScenarioWorld, name: string): string => {
  const id = world.calendarIds?.[name];
  if (id === undefined) {
    throw new Error(`The calendar "${name}" was not set up in this scenario.`);
  }
  return id;
};
