// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const eventTitleSchema = z.string().trim().min(1).max(200);

export const eventLocationSchema = z.string().trim().min(1).max(200);

export const eventDescriptionSchema = z.string().trim().min(1).max(2000);

// Years before 1000 are refused. Date.UTC maps years 0 to 99 to the 1900s.
export const eventDateSchema = z.iso.date().refine((value) => Number(value.slice(0, 4)) >= 1000, {
  message: "Send a date from the year 1000 onwards",
});

export const eventInstantSchema = z.iso.datetime({ offset: true });
