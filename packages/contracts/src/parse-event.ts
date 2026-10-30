// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { EventDefinition } from "./types.js";

export const parseEvent = <Name extends string, Version extends number, Payload extends z.ZodType>(
  definition: EventDefinition<Name, Version, Payload>,
  input: unknown,
) => {
  return definition.envelope.parse(input);
};
