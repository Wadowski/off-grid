// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "./family-created-v1.js";
import { familyMemberAddedV1 } from "./family-member-added-v1.js";
import { familyMemberRemovedV1 } from "./family-member-removed-v1.js";
import { familyMemberUpdatedV1 } from "./family-member-updated-v1.js";
import { userCreatedV1 } from "./user-created-v1.js";
import { userProfileUpdatedV1 } from "./user-profile-updated-v1.js";
import { userNotifiedV1 } from "./user-notified-v1.js";
import type { AnyEventDefinition } from "./types.js";

export const eventDefinitions: readonly AnyEventDefinition[] = [
  familyCreatedV1,
  familyMemberAddedV1,
  familyMemberUpdatedV1,
  familyMemberRemovedV1,
  userCreatedV1,
  userProfileUpdatedV1,
  userNotifiedV1,
];
