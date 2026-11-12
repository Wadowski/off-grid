// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";
import type { eventEnvelopeSchema } from "./event-envelope-schema.js";
import type { accessGroupIdSchema } from "./access-group-id-schema.js";
import type { emailCodeRequestSchema } from "./email-code-request-schema.js";
import type { errorResponseSchema } from "./error-response-schema.js";
import type { passwordRecoveryOptionsSchema } from "./password-recovery-options-schema.js";
import type { passwordRecoveryRequestSchema } from "./password-recovery-request-schema.js";
import type { passwordResetRequestSchema } from "./password-reset-request-schema.js";
import type { adminUserSchema } from "./admin-user-schema.js";
import type { mailSettingsRequestSchema } from "./mail-settings-request-schema.js";
import type { instanceSettingsUpdateSchema } from "./instance-settings-update-schema.js";
import type { createCalendarRequestSchema } from "./create-calendar-request-schema.js";
import type { updateCalendarRequestSchema } from "./update-calendar-request-schema.js";
import type { familyIdSchema } from "./family-id-schema.js";
import type { timestampSchema } from "./timestamp-schema.js";
import type { userIdSchema } from "./user-id-schema.js";
import type { createCalendarEventRequestSchema } from "./create-calendar-event-request-schema.js";
import type { updateCalendarEventRequestSchema } from "./update-calendar-event-request-schema.js";
import type { calendarTimeZoneSchema } from "./calendar-time-zone-response-schema.js";
import type { calendarEventSchema } from "./calendar-event-schema.js";
import type { MAIL_PRESETS, MAIL_PROVIDERS, MAIL_SECURITY } from "./constants.js";

export type FamilyId = z.infer<typeof familyIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type AccessGroupId = z.infer<typeof accessGroupIdSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PasswordRecoveryRequest = z.infer<typeof passwordRecoveryRequestSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type EmailCodeRequest = z.infer<typeof emailCodeRequestSchema>;
export type PasswordRecoveryOptions = z.infer<typeof passwordRecoveryOptionsSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type MailSettingsRequest = z.infer<typeof mailSettingsRequestSchema>;
export type InstanceSettingsUpdate = z.infer<typeof instanceSettingsUpdateSchema>;
export type CreateCalendarRequest = z.infer<typeof createCalendarRequestSchema>;
export type UpdateCalendarRequest = z.infer<typeof updateCalendarRequestSchema>;
export type NewCalendarEventInput = z.infer<typeof createCalendarEventRequestSchema>;
export type CalendarEventUpdateInput = z.infer<typeof updateCalendarEventRequestSchema>;
export type TimeZoneSetting = z.infer<typeof calendarTimeZoneSchema>;
export type CalendarEventResponse = z.input<typeof calendarEventSchema>;

export type MailProvider = (typeof MAIL_PROVIDERS)[number];

export type MailSecurity = (typeof MAIL_SECURITY)[number];

export type MailServerPreset = (typeof MAIL_PRESETS)[keyof typeof MAIL_PRESETS];

export interface EventDefinition<
  Name extends string = string,
  Version extends number = number,
  Payload extends z.ZodType = z.ZodType,
> {
  readonly name: Name;
  readonly version: Version;
  readonly schema: Payload;
  readonly envelope: ReturnType<typeof eventEnvelopeSchema<Name, Version, Payload>>;
}

export type AnyEventDefinition = EventDefinition;

export interface ReleasedEvent {
  version: number;
  schema: unknown;
}

export type EventSchemas = Record<string, ReleasedEvent>;

export interface ContractComparison {
  changed: string[];
  missing: string[];
  added: string[];
}
