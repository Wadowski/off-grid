// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";

export const sha256Of = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
