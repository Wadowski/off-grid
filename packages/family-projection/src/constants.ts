// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";

export const FAMILY_MEMBERSHIP_EVENTS = [familyMemberAddedV1, familyMemberRemovedV1] as const;
