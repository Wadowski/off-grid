// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "@offgrid/contracts";
import type { Subscription } from "@offgrid/event-bus";
import { projectFamilyCreated } from "./project-family-created.js";

export const FAMILY_SUMMARY_SUBSCRIBER = "family-summary";

export const familySummarySubscription = {
  name: FAMILY_SUMMARY_SUBSCRIBER,
  event: familyCreatedV1,
  runAs: "family",
  handler: projectFamilyCreated,
} satisfies Subscription<typeof familyCreatedV1>;
