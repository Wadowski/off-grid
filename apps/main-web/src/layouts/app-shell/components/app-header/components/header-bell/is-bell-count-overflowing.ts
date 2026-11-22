// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BELL_COUNT_CAP } from "../../../../../../notifications/constants.js";

export const isBellCountOverflowing = (count: number): boolean => count > BELL_COUNT_CAP;
