// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const releasedSnapshotSchema = z.record(
  z.string(),
  z.object({ version: z.number().int().min(1), schema: z.unknown() }),
);
