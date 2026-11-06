// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AttemptKind } from "../../types.js";
import { digestToken } from "../tokens/digest-token.js";

export const attemptKey = (kind: AttemptKind, email: string): string =>
  digestToken(`${kind}:${email}`);
