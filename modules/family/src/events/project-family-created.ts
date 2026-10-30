// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { classifySourceVersion, type HandlerContext } from "@offgrid/event-bus";
import { readSummaryVersion } from "../infrastructure/read-summary-version.js";
import { setUserContext } from "../infrastructure/set-user-context.js";
import { upsertSummary } from "../infrastructure/upsert-summary.js";
import type { FamilyCreatedEvent } from "../types.js";

export const projectFamilyCreated = async (
  event: FamilyCreatedEvent,
  { tx }: HandlerContext,
): Promise<void> => {
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
};
