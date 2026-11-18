// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STORAGE_KEY_PATTERN } from "../../constants.js";

export const isValidStorageKey = (key: string): boolean => STORAGE_KEY_PATTERN.test(key);
