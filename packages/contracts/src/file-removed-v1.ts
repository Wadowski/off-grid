// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineEvent } from "./define-event.js";
import { fileRemovedPayloadSchema } from "./file-removed-payload-schema.js";

export const fileRemovedV1 = defineEvent({
  name: "file-removed-v1",
  version: 1,
  schema: fileRemovedPayloadSchema,
});
