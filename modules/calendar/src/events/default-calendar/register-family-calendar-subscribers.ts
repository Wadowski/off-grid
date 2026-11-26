// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarSubscriberContext } from "../../types.js";
import { familyCalendarSubscription } from "./family-calendar-subscription.js";

export const registerFamilyCalendarSubscribers = (context: CalendarSubscriberContext): void => {
  context.eventBus.subscribe(familyCalendarSubscription(context.db));
};
