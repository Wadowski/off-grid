// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StoredEvent } from "./types.js";

export const toEnvelope = (stored: StoredEvent) => {
  return {
    id: stored.id,
    type: stored.type,
    version: stored.version,
    occurredAt: stored.occurredAt,
    traceId: stored.traceId,
    familyId: stored.familyId,
    sourceVersion: stored.sourceVersion,
    payload: stored.payload,
  };
};
