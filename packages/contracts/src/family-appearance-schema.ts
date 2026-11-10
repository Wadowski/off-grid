// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const familyAccentSchema = z.enum([
  "blue",
  "sky",
  "teal",
  "green",
  "lime",
  "amber",
  "orange",
  "red",
  "pink",
  "purple",
  "indigo",
  "slate",
]);

export type FamilyAccent = z.infer<typeof familyAccentSchema>;

export const familyPurposeSchema = z.enum(["household", "getaway", "extended"]);

export type FamilyPurpose = z.infer<typeof familyPurposeSchema>;
