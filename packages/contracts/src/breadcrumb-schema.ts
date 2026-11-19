// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveIdSchema } from "./drive-id-schema.js";
import { fileIdSchema } from "./file-id-schema.js";
import { fileNameSchema } from "./file-name-schema.js";
import { nameSchema } from "./name-schema.js";

export const breadcrumbSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("drive"),
    id: driveIdSchema,
    name: nameSchema,
  }),
  z.object({
    kind: z.literal("folder"),
    id: fileIdSchema,
    name: fileNameSchema,
  }),
]);
