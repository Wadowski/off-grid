// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { envelopeFields } from "./envelope-fields.js";

export const eventEnvelopeSchema = <
  Name extends string,
  Version extends number,
  Payload extends z.ZodType,
>(
  name: Name,
  version: Version,
  payload: Payload,
) => {
  return envelopeFields.extend({
    type: z.literal(name),
    version: z.literal(version),
    payload,
  });
};
