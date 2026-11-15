// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { ReplaySubscription } from "./types.js";

export const definitionsOf = (
  subscription: ReplaySubscription,
): ReadonlyMap<string, AnyEventDefinition> => {
  const events = "events" in subscription ? subscription.events : [subscription.event];
  return new Map(events.map((definition) => [definition.name, definition]));
};
