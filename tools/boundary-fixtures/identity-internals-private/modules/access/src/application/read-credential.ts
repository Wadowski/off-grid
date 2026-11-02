// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readCredential } from "../../../identity/src/infrastructure/read-credential.js";

export const loadCredential = (userId: string): string => readCredential(userId);
