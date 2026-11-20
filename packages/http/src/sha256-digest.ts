// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";

export const sha256Digest = (value: string): Buffer => createHash("sha256").update(value).digest();
