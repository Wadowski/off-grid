// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyIdSchema, timestampSchema, uuidSchema } from "./primitives.js";

// Event names are kebab-case and end in the version, for example `family-created-v1`.
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/;

const envelopeFields = z.object({
  id: uuidSchema,
  type: z.string(),
  version: z.number().int().min(1),
  occurredAt: timestampSchema,
  traceId: z.string().min(1).max(128),
  familyId: familyIdSchema.nullable(),
  sourceVersion: z.number().int().min(1),
});

/**
 * The envelope every event carries. `sourceVersion` is monotonic per entity and
 * lets projections skip stale or repeated deliveries.
 */
export function eventEnvelopeSchema<
  Name extends string,
  Version extends number,
  Payload extends z.ZodType,
>(name: Name, version: Version, payload: Payload) {
  return envelopeFields.extend({
    type: z.literal(name),
    version: z.literal(version),
    payload,
  });
}

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

/**
 * Defines a versioned event. The name must end in `-v<version>`, so a released
 * event can never be redefined under the same name with a different version.
 */
export function defineEvent<
  Name extends string,
  Version extends number,
  Payload extends z.ZodType,
>(definition: {
  name: Name;
  version: Version;
  schema: Payload;
}): EventDefinition<Name, Version, Payload> {
  const { name, version, schema } = definition;
  const match = EVENT_NAME_PATTERN.exec(name);
  if (!match || Number(match[1]) !== version) {
    throw new Error(`Event name "${name}" must be kebab-case and end in "-v${version}".`);
  }
  return {
    name,
    version,
    schema,
    envelope: eventEnvelopeSchema(name, version, schema),
  };
}

/** Validates an incoming event against its definition. Throws a ZodError when it is malformed. */
export function parseEvent<Name extends string, Version extends number, Payload extends z.ZodType>(
  definition: EventDefinition<Name, Version, Payload>,
  input: unknown,
) {
  return definition.envelope.parse(input);
}
