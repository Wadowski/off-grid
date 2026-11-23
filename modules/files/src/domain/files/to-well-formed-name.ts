// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { LONE_SURROGATE_PATTERN } from "../../constants.js";

export const toWellFormedName = (name: string): string => name.replace(LONE_SURROGATE_PATTERN, "_");
