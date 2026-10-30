// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { can, highestAccess, visibleTo } from "./access.js";
export { readOutcome } from "./read-outcome.js";
export type {
  AccessGrant,
  AccessGroup,
  AccessType,
  Action,
  Resource,
  ReadOutcome,
  ReadOutcomeInput,
  Subject,
  VisibilityFilter,
} from "./types.js";
