// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

const isKnownTimeZone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const timeZoneSchema = z
  .string()
  .min(1)
  .max(64)
  .refine(isKnownTimeZone, { message: "Send an IANA time zone name" });
