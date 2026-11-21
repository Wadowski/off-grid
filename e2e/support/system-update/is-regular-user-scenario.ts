// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ScenarioWorld } from "../fixtures.js";

export const isRegularUserScenario = (world: ScenarioWorld): boolean =>
  world.member !== undefined && world.admin === undefined;
