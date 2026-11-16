// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { crossEntityLinkSchema } from "./cross-entity-link-schema.js";
import { eventTitleSchema } from "./calendar-event-fields-schema.js";

export const crossEntityLinkWithTitleSchema = crossEntityLinkSchema.extend({
  title: eventTitleSchema,
});
