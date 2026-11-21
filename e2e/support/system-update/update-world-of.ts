// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ScenarioWorld } from "../fixtures.js";
import type { SystemUpdateWorld } from "./types.js";

export const updateWorldOf = (world: ScenarioWorld): SystemUpdateWorld => {
  world.systemUpdate ??= {
    previousVersion: "",
    targetVersion: "",
    backupsBroken: false,
    nightlyTouched: false,
  };
  return world.systemUpdate;
};
