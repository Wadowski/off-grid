// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesSubscriberContext } from "../../types.js";
import { familyDriveSubscription } from "./family-drive-subscription.js";
import { personalDriveSubscription } from "./personal-drive-subscription.js";

export const registerDriveSubscribers = (context: FilesSubscriberContext): void => {
  context.eventBus.subscribe(personalDriveSubscription(context.db));
  context.eventBus.subscribe(familyDriveSubscription(context.db));
};
