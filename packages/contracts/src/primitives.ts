// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const uuidSchema = z.uuid();

export const familyIdSchema = uuidSchema.brand<"FamilyId">();
export type FamilyId = z.infer<typeof familyIdSchema>;

export const userIdSchema = uuidSchema.brand<"UserId">();
export type UserId = z.infer<typeof userIdSchema>;

export const accessGroupIdSchema = uuidSchema.brand<"AccessGroupId">();
export type AccessGroupId = z.infer<typeof accessGroupIdSchema>;

export const timestampSchema = z.iso.datetime();
export type Timestamp = z.infer<typeof timestampSchema>;

/** Stable, machine-readable error code, for example `VALIDATION_FAILED`. */
export const errorCodeSchema = z
  .string()
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/);

export const errorResponseSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1).max(500),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
