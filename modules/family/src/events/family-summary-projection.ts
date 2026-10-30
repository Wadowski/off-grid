// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "@offgrid/contracts";
import {
  classifySourceVersion,
  type EventOf,
  type HandlerContext,
  type Subscription,
} from "@offgrid/event-bus";
import {
  readSummaryVersion,
  setUserContext,
  upsertSummary,
} from "../infrastructure/family-store.js";

export const FAMILY_SUMMARY_SUBSCRIBER = "family-summary";

export type FamilyCreatedEvent = EventOf<typeof familyCreatedV1>;

export async function projectFamilyCreated(
  event: FamilyCreatedEvent,
  { tx }: HandlerContext,
): Promise<void> {
  if (event.familyId === null) {
    throw new Error("family-created event has no family");
  }
  const userId = event.payload.creatorUserId;
  await setUserContext(tx, userId);
  const stored = await readSummaryVersion(tx, userId, event.familyId);
  const decision = classifySourceVersion(stored, event.sourceVersion);
  if (decision === "gap") {
    throw new Error("family summary received a source version gap");
  }
  if (decision !== "apply") {
    return;
  }
  await upsertSummary(tx, {
    userId,
    familyId: event.familyId,
    name: event.payload.name,
    sourceVersion: event.sourceVersion,
  });
}

export const familySummarySubscription = {
  name: FAMILY_SUMMARY_SUBSCRIBER,
  event: familyCreatedV1,
  runAs: "family",
  handler: projectFamilyCreated,
} satisfies Subscription<typeof familyCreatedV1>;
