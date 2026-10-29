// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";
import type { EventDefinition } from "./types.js";

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/;

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

export function parseEvent<Name extends string, Version extends number, Payload extends z.ZodType>(
  definition: EventDefinition<Name, Version, Payload>,
  input: unknown,
) {
  return definition.envelope.parse(input);
}
