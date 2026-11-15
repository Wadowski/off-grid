// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarReminderDueV1 } from "./calendar-reminder-due-v1.js";

const eventId = "0195e9a4-7c1d-7b2e-8f3a-1234567890ab";
const userId = "0195e9a4-7c1d-7b2e-8f3a-abcdefabcdef";

describe("calendarReminderDueV1", () => {
  it("accepts exactly the event and recipient ids", () => {
    expect(calendarReminderDueV1.schema.safeParse({ eventId, userId }).success).toBe(true);
  });

  it("refuses a title or any other personal field", () => {
    expect(
      calendarReminderDueV1.schema.safeParse({ eventId, userId, title: "Dentist" }).success,
    ).toBe(false);
  });

  it("refuses a payload without the recipient", () => {
    expect(calendarReminderDueV1.schema.safeParse({ eventId }).success).toBe(false);
  });
});
