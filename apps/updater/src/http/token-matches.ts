// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { timingSafeEqual } from "node:crypto";
import { sha256Digest } from "./sha256-digest.js";

export const tokenMatches = (expectedToken: string, presentedToken: string): boolean =>
  timingSafeEqual(sha256Digest(expectedToken), sha256Digest(presentedToken));
