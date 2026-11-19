// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAMILY_MEMBERSHIP_EVENTS } from "./constants.js";

export const familyMembershipSubscriptionOf = (moduleName: string) => ({
  name: `${moduleName}-family-membership`,
  events: FAMILY_MEMBERSHIP_EVENTS,
  runAs: moduleName,
  onFailure: "halt" as const,
});
