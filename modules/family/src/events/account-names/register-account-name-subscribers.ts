// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userCreatedV1, userProfileUpdatedV1 } from "@offgrid/contracts";
import type { EventBus } from "@offgrid/event-bus";
import { applyAccountName } from "./apply-account-name.js";

export const registerAccountNameSubscribers = (eventBus: EventBus): void => {
  eventBus.subscribe({
    name: "family-account-name-from-user-created",
    event: userCreatedV1,
    runAs: "family",
    handler: (event, { tx }) =>
      applyAccountName(tx, {
        userId: event.payload.userId,
        displayName: event.payload.displayName,
        sourceVersion: event.sourceVersion,
      }),
  });
  eventBus.subscribe({
    name: "family-account-name-from-user-profile-updated",
    event: userProfileUpdatedV1,
    runAs: "family",
    handler: (event, { tx }) =>
      applyAccountName(tx, {
        userId: event.payload.userId,
        displayName: event.payload.displayName,
        sourceVersion: event.sourceVersion,
      }),
  });
};
