// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomInt } from "node:crypto";

export function scenarioClientAddress(): string {
  return `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;
}
