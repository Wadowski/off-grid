// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineEvent } from "./define-event.js";
import { driveEventPayloadSchema } from "./drive-event-payload-schema.js";

export const driveCreatedV1 = defineEvent({
  name: "drive-created-v1",
  version: 1,
  schema: driveEventPayloadSchema,
});
