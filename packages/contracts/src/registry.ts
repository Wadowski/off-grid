// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "./events.js";

/**
 * Every event defined in this package. `check:contracts` compares each entry
 * against `released-events.json`. Add new events here as they are defined;
 * never edit an entry that has been released, add a `-v2` instead.
 */
export const eventDefinitions: readonly AnyEventDefinition[] = [];
