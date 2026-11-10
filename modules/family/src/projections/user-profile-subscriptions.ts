// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userCreatedV1, userDisplayNameChangedV1 } from "@offgrid/contracts";
import type { Subscription } from "@offgrid/event-bus";
import { upsertUserProfile } from "./upsert-user-profile.js";

const RUN_AS = "family";

const userCreatedProfile: Subscription<typeof userCreatedV1> = {
  name: "family-user-created-profile",
  event: userCreatedV1,
  runAs: RUN_AS,
  handler: async (event, context) => {
    await upsertUserProfile(
      context.tx,
      event.payload.userId,
      event.payload.displayName,
      event.sourceVersion,
    );
  },
};

const userDisplayNameProfile: Subscription<typeof userDisplayNameChangedV1> = {
  name: "family-user-display-name-profile",
  event: userDisplayNameChangedV1,
  runAs: RUN_AS,
  handler: async (event, context) => {
    await upsertUserProfile(
      context.tx,
      event.payload.userId,
      event.payload.displayName,
      event.sourceVersion,
    );
  },
};

export { userCreatedProfile, userDisplayNameProfile };
