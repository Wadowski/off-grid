// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";
import type { eventEnvelopeSchema } from "./event-envelope-schema.js";
import type { accessGroupIdSchema } from "./access-group-id-schema.js";
import type { errorResponseSchema } from "./error-response-schema.js";
import type { familyIdSchema } from "./family-id-schema.js";
import type { timestampSchema } from "./timestamp-schema.js";
import type { userIdSchema } from "./user-id-schema.js";
import type { MAIL_PRESETS, MAIL_PROVIDERS, MAIL_SECURITY } from "./constants.js";

export type FamilyId = z.infer<typeof familyIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type AccessGroupId = z.infer<typeof accessGroupIdSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

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
