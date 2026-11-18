// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REPLACED_CONTAINER_SUFFIX } from "../constants.js";

export const originalNameOf = (replacedName: string): string =>
  replacedName.slice(0, -REPLACED_CONTAINER_SUFFIX.length);
