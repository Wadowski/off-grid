// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { EventDefinition } from "./types.js";
import { EVENT_NAME_PATTERN } from "./constants.js";
import { eventEnvelopeSchema } from "./event-envelope-schema.js";

export const defineEvent = <
  Name extends string,
  Version extends number,
  Payload extends z.ZodType,
>(definition: {
  name: Name;
  version: Version;
  schema: Payload;
}): EventDefinition<Name, Version, Payload> => {
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
};
