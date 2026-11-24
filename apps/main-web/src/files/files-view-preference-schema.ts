// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListDirectionSchema, fileListSortSchema } from "@offgrid/contracts";
import { z } from "zod";

export const filesViewPreferenceSchema = z.object({
  view: z.enum(["list", "grid"]),
  sort: fileListSortSchema,
  direction: fileListDirectionSchema,
});
