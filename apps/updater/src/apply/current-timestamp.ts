// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Clock } from "../types.js";

export const currentTimestamp = (clock: Clock): string => new Date(clock.now()).toISOString();
