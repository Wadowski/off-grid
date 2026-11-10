// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const familyAccentSchema = z.enum(["blue", "sage", "terracotta", "lilac"]);

export type FamilyAccent = z.infer<typeof familyAccentSchema>;

export const familyPurposeSchema = z.enum(["household", "getaway", "extended"]);

export type FamilyPurpose = z.infer<typeof familyPurposeSchema>;
