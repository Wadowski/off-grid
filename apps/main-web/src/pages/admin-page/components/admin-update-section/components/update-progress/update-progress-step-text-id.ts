// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStepName } from "../../types.js";

export const toUpdateStepTextId = (name: UpdateStepName) => `admin.update.steps.${name}` as const;
