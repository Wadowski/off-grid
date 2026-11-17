// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineEvent } from "./define-event.js";
import { fileEventPayloadSchema } from "./file-event-payload-schema.js";

export const fileUpdatedV1 = defineEvent({
  name: "file-updated-v1",
  version: 1,
  schema: fileEventPayloadSchema,
});
