// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REPLACED_CONTAINER_SUFFIX } from "../constants.js";

export const isReplacedName = (name: string): boolean => name.endsWith(REPLACED_CONTAINER_SUFFIX);
