// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { Delivery, EventOf, MultiEventSubscription, Subscription } from "./types.js";

// The casts below are safe because deliverOne parses each event with the definition it
// matched by name before calling the handler.
export const singleDelivery = <D extends AnyEventDefinition>(
  subscription: Subscription<D>,
): Delivery => ({
  name: subscription.name,
  events: [subscription.event],
  runAs: subscription.runAs,
  onFailure: subscription.onFailure ?? "skip",
  handler: (event, context) => subscription.handler(event as unknown as EventOf<D>, context),
});

export const multiDelivery = <Ds extends readonly AnyEventDefinition[]>(
  subscription: MultiEventSubscription<Ds>,
): Delivery => ({
  name: subscription.name,
  events: subscription.events,
  runAs: subscription.runAs,
  onFailure: subscription.onFailure ?? "skip",
  handler: (event, context) =>
    subscription.handler(event as unknown as EventOf<Ds[number]>, context),
});
