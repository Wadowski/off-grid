// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventFormValues } from "../types.js";

export const toggleGuest = (values: EventFormValues, userId: string): EventFormValues => ({
  ...values,
  guestUserIds: values.guestUserIds.includes(userId)
    ? values.guestUserIds.filter((guestUserId) => guestUserId !== userId)
    : [...values.guestUserIds, userId],
});
